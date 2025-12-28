import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";
import { hash, compare } from "bcryptjs";

// Validation schema for profile update
const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
});

// Validation schema for password change
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// Combined update schema
const updateUserSchema = z.object({
  profile: profileUpdateSchema.optional(),
  passwordChange: passwordChangeSchema.optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        publications: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            logoUrl: true,
            createdAt: true,
            _count: {
              select: {
                posts: true,
                subscriptions: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        subscriptions: {
          where: { status: "active" },
          select: {
            id: true,
            tier: true,
            status: true,
            createdAt: true,
            publication: {
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                logoUrl: true,
                owner: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            publications: true,
            subscriptions: true,
            posts: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    const updateData: Record<string, unknown> = {};

    // Handle profile updates
    if (validatedData.profile) {
      if (validatedData.profile.name !== undefined) {
        updateData.name = validatedData.profile.name;
      }
      if (validatedData.profile.bio !== undefined) {
        updateData.bio = validatedData.profile.bio || null;
      }
      if (validatedData.profile.image !== undefined) {
        updateData.image = validatedData.profile.image || null;
      }
    }

    // Handle password change
    if (validatedData.passwordChange) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true },
      });

      if (!user?.password) {
        return NextResponse.json(
          { success: false, error: "Cannot change password for OAuth accounts" },
          { status: 400 }
        );
      }

      const isValidPassword = await compare(
        validatedData.passwordChange.currentPassword,
        user.password
      );

      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      updateData.password = await hash(validatedData.passwordChange.newPassword, 12);
    }

    // Perform the update if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}
