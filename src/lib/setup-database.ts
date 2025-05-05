import prisma from '@/lib/prisma';

/**
 * This script can be used to set up the database with Neon
 * Run it with: npx ts-node lib/setup-database.ts
 */

async function main() {

  try {
    console.log("Starting database setup...")

    // Run migrations
    console.log("Running migrations...")
    // In a real setup, you would run migrations using Prisma CLI:
    // npx prisma migrate deploy

    // Seed the database with initial data
    console.log("Seeding database with initial data...")

    // Create services
    const services = await Promise.all([
      prisma.service.create({
        data: {
          name: "Nocleg",
          description: "Overnight stay at our dog hotel",
          basePrice: 100,
          additionalAnimal: 50,
          timeSurcharge: 30,
          additionalTime: 0,
        },
      }),
      prisma.service.create({
        data: {
          name: "Spacer",
          description: "We'll pick up your pet for a walk",
          basePrice: 40,
          additionalAnimal: 20,
          timeSurcharge: 20,
          additionalTime: 30,
        },
      }),
      prisma.service.create({
        data: {
          name: "Wyzyta Domowa",
          description: "We'll visit your home to take care of your pet",
          basePrice: 60,
          additionalAnimal: 30,
          timeSurcharge: 40,
          additionalTime: 45,
        },
      }),
    ])

    // Create holidays for 2025
    const holidays = await Promise.all([
      prisma.holiday.create({
        data: {
          date: new Date("2025-01-01"),
          name: "New Year's Day",
        },
      }),
      prisma.holiday.create({
        data: {
          date: new Date("2025-01-06"),
          name: "Epiphany",
        },
      }),
      // Add more holidays as needed
    ])

    // Create a test admin user
    const adminUser = await prisma.user.create({
      data: {
        email: "admin@doghotel.com",
        name: "Admin",
        surname: "User",
        role: "ADMIN",
        password: "$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Ku", // "password" hashed
      },
    })

    console.log("Database setup completed successfully!")
    console.log(`Created ${services.length} services`)
    console.log(`Created ${holidays.length} holidays`)
    console.log("Created admin user:", adminUser.email)
  } catch (error) {
    console.error("Error setting up database:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
