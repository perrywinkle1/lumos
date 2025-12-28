import Stripe from "stripe";

// Validate environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY not found - payment features will be disabled");
}

// Server-side Stripe instance
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
      typescript: true,
    })
  : null;

// Plan definitions with features
export const STRIPE_PLANS = {
  FREE: {
    id: "free",
    name: "Free",
    price: 0,
    interval: null,
    features: [
      "Unlimited free posts",
      "Basic analytics",
      "Email newsletter",
    ],
  },
  MONTHLY: {
    id: "monthly",
    name: "Monthly",
    price: 500, // $5.00
    interval: "month" as const,
    features: [
      "All free features",
      "Access to paid posts",
      "Early access to new features",
      "Support the writer",
    ],
  },
  YEARLY: {
    id: "yearly",
    name: "Yearly",
    price: 5000, // $50.00 (2 months free)
    interval: "year" as const,
    features: [
      "All monthly features",
      "2 months free",
      "Exclusive yearly member content",
      "Priority support",
    ],
  },
} as const;

export type PlanType = keyof typeof STRIPE_PLANS;

// Helper to format price
export function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceInCents / 100);
}

// Get or create a Stripe customer for a user
export async function getOrCreateCustomer({
  userId,
  email,
  name,
}: {
  userId: string;
  email: string;
  name?: string | null;
}): Promise<string> {
  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  // Import prisma dynamically to avoid circular dependencies
  const { default: prisma } = await import("@/lib/db");

  // Check if user already has a Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      userId,
    },
  });

  // Save customer ID to user
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

// Create or get a price for a publication
export async function getOrCreatePrice({
  publicationId,
  publicationName,
  interval,
  unitAmount,
}: {
  publicationId: string;
  publicationName: string;
  interval: "month" | "year";
  unitAmount: number;
}): Promise<string> {
  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  // Search for existing price
  const existingPrices = await stripe.prices.search({
    query: `active:'true' AND metadata['publicationId']:'${publicationId}' AND metadata['interval']:'${interval}'`,
  });

  if (existingPrices.data.length > 0) {
    return existingPrices.data[0].id;
  }

  // Get or create product for publication
  const existingProducts = await stripe.products.search({
    query: `active:'true' AND metadata['publicationId']:'${publicationId}'`,
  });

  let productId: string;

  if (existingProducts.data.length > 0) {
    productId = existingProducts.data[0].id;
  } else {
    const product = await stripe.products.create({
      name: `${publicationName} Subscription`,
      metadata: {
        publicationId,
      },
    });
    productId = product.id;
  }

  // Create price
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: unitAmount,
    currency: "usd",
    recurring: {
      interval,
    },
    metadata: {
      publicationId,
      interval,
    },
  });

  return price.id;
}

// Create a checkout session for subscription
export async function createCheckoutSession({
  userId,
  userEmail,
  userName,
  publicationId,
  publicationSlug,
  publicationName,
  priceId,
  interval,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  userEmail: string;
  userName?: string | null;
  publicationId: string;
  publicationSlug: string;
  publicationName: string;
  priceId?: string;
  interval: "month" | "year";
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  // Get or create customer
  const customerId = await getOrCreateCustomer({
    userId,
    email: userEmail,
    name: userName,
  });

  // Get or create price if not provided
  const finalPriceId = priceId || await getOrCreatePrice({
    publicationId,
    publicationName,
    interval,
    unitAmount: interval === "month" ? STRIPE_PLANS.MONTHLY.price : STRIPE_PLANS.YEARLY.price,
  });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price: finalPriceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: {
        userId,
        publicationId,
        publicationSlug,
      },
    },
    metadata: {
      userId,
      publicationId,
      publicationSlug,
    },
    allow_promotion_codes: true,
    billing_address_collection: "auto",
  });

  return session;
}

// Create a customer portal session
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

// Cancel a subscription at period end
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });

  return subscription;
}

// Reactivate a subscription that was set to cancel
export async function reactivateSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });

  return subscription;
}

// Get subscription details
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch {
    return null;
  }
}

// Verify webhook signature
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET not configured");
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

// Helper to check if subscription is active
export function isSubscriptionActive(status: string): boolean {
  return ["active", "trialing"].includes(status);
}

// Helper to get user's active subscription for a publication
export async function getUserSubscription(
  userId: string,
  publicationId: string
) {
  const { default: prisma } = await import("@/lib/db");

  const subscription = await prisma.subscription.findUnique({
    where: {
      userId_publicationId: {
        userId,
        publicationId,
      },
    },
  });

  return subscription;
}

// Check if user has paid access to a publication
export async function hasPaidAccess(
  userId: string,
  publicationId: string
): Promise<boolean> {
  const subscription = await getUserSubscription(userId, publicationId);

  if (!subscription) {
    return false;
  }

  return (
    subscription.tier === "paid" &&
    isSubscriptionActive(subscription.status)
  );
}
