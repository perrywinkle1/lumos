import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import prisma from "@/lib/db";
import { constructWebhookEvent, stripe } from "@/lib/stripe";

// Disable body parsing - we need the raw body for signature verification
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;
      }

      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;
      }

      case "invoice.payment_succeeded": {
        await handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice
        );
        break;
      }

      case "invoice.payment_failed": {
        await handleInvoicePaymentFailed(
          event.data.object as Stripe.Invoice
        );
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.userId;
  const publicationId = session.metadata?.publicationId;
  const subscriptionId = session.subscription as string;

  if (!userId || !publicationId || !subscriptionId) {
    console.error("Missing metadata in checkout session:", {
      userId,
      publicationId,
      subscriptionId,
    });
    return;
  }

  // Retrieve full subscription details
  const subscription = await stripe!.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id;

  // Create or update subscription in database
  await prisma.subscription.upsert({
    where: {
      userId_publicationId: {
        userId,
        publicationId,
      },
    },
    create: {
      userId,
      publicationId,
      tier: "paid",
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      tier: "paid",
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  console.log(
    `Subscription created/updated for user ${userId} to publication ${publicationId}`
  );
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  const publicationId = subscription.metadata?.publicationId;

  if (!userId || !publicationId) {
    // Try to find subscription by Stripe subscription ID
    const existingSubscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!existingSubscription) {
      console.error("Cannot find subscription in database:", subscription.id);
      return;
    }

    // Update the existing subscription
    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        stripePriceId: subscription.items.data[0]?.price.id,
      },
    });

    console.log(`Subscription ${subscription.id} updated`);
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;

  await prisma.subscription.upsert({
    where: {
      userId_publicationId: {
        userId,
        publicationId,
      },
    },
    create: {
      userId,
      publicationId,
      tier: "paid",
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      stripePriceId: priceId,
    },
  });

  console.log(
    `Subscription updated for user ${userId} to publication ${publicationId}`
  );
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Find subscription by Stripe subscription ID
  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!existingSubscription) {
    console.error(
      "Cannot find subscription to delete in database:",
      subscription.id
    );
    return;
  }

  // Update to canceled status instead of deleting
  // This keeps the record for history and allows users to resubscribe
  await prisma.subscription.update({
    where: { id: existingSubscription.id },
    data: {
      status: "canceled",
      tier: "free", // Downgrade to free tier
      cancelAtPeriodEnd: false,
    },
  });

  console.log(`Subscription ${subscription.id} marked as canceled`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    return;
  }

  // Update subscription status to active if it was past_due
  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (existingSubscription && existingSubscription.status === "past_due") {
    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: { status: "active" },
    });

    console.log(
      `Subscription ${subscriptionId} restored to active after payment`
    );
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    return;
  }

  // Update subscription status to past_due
  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (existingSubscription) {
    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: { status: "past_due" },
    });

    console.log(`Subscription ${subscriptionId} marked as past_due`);
  }
}
