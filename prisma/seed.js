const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);
  
  const user = await prisma.user.upsert({
    where: { email: "learner@example.com" },
    update: {},
    create: {
      email: "learner@example.com",
      name: "Alex Learner",
      password,
      bio: "I love learning new things!",
    },
  });

  const pub = await prisma.publication.upsert({
    where: { slug: "digital-basics" },
    update: {},
    create: {
      name: "Digital Basics",
      slug: "digital-basics",
      description: "A guide to the fundamental tools of the modern world.",
      themeColor: "#ff6719",
      ownerId: user.id,
    },
  });

  await prisma.post.createMany({
    data: [
      {
        title: "Mastering Your First Smartphone",
        slug: "mastering-smartphone",
        subtitle: "A step-by-step guide for beginners",
        content: "<p>Smartphones are powerful tools that can help you stay connected with family and friends...</p><p>First, let's look at the home screen...</p>",
        excerpt: "Learn how to navigate your new device with confidence and ease.",
        isPublished: true,
        isPaid: false,
        authorId: user.id,
        publicationId: pub.id,
        publishedAt: new Date(),
      },
      {
        title: "Staying Safe Online",
        slug: "online-safety",
        subtitle: "Protect your privacy and information",
        content: "<p>The internet is a vast place, but with a few simple habits, you can stay safe...</p><p>Tip 1: Use strong passwords...</p>",
        excerpt: "Practical tips for identifying scams and securing your personal data.",
        isPublished: true,
        isPaid: true,
        authorId: user.id,
        publicationId: pub.id,
        publishedAt: new Date(),
      },
      {
        title: "Connecting with Video Calls",
        slug: "video-calls",
        subtitle: "How to use Zoom and FaceTime",
        content: "<p>Video calling is the next best thing to being there in person...</p>",
        excerpt: "A simple guide to setting up and enjoying video calls with your loved ones.",
        isPublished: false,
        isPaid: false,
        authorId: user.id,
        publicationId: pub.id,
      }
    ],
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

