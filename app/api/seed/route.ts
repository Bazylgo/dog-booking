import { NextResponse } from "next/server"
import prisma from "@/lib/db"

// This route is for seeding the database with initial data
export async function POST() {
  try {
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
      prisma.holiday.create({
        data: {
          date: new Date("2025-04-20"),
          name: "Easter Sunday",
        },
      }),
      prisma.holiday.create({
        data: {
          date: new Date("2025-04-21"),
          name: "Easter Monday",
        },
      }),
      prisma.holiday.create({
        data: {
          date: new Date("2025-05-01"),
          name: "Labor Day",
        },
      }),
      prisma.holiday.create({
        data: {
          date: new Date("2025-05-03"),
          name: "Constitution Day",
        },
      }),
      prisma.holiday.create({
        data: {
          date: new Date("2025-06-08"),
          name: "Pentecost Sunday",
        },
      }),
      prisma.holiday.create({
        data: {
          date: new Date("2025-06-19"),
          name: "Corpus Christi",
        },
      }),
      prisma.holiday.create({
        data: {
          date: new Date("2025-08-15"),
          name: "Assumption of Mary",
        },
      }),
      prisma.holiday.create({
        data: {
          date: new Date("2025-11-01"),
          name: "All Saints' Day",
        },
      }),
      prisma.holiday.create({
        data: {
          date: new Date("2025-11-11"),
          name: "Independence Day",
        },
      }),
      prisma.holiday.create({
        data: {
          date: new Date("2025-12-25"),
          name: "Christmas Day",
        },
      }),
      prisma.holiday.create({
        data: {
          date: new Date("2025-12-26"),
          name: "Second Day of Christmas",
        },
      }),
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

    // Create a test regular user with pets
    const regularUser = await prisma.user.create({
      data: {
        email: "user@example.com",
        name: "John",
        surname: "Doe",
        phone: "+48123456789",
        address: "Marszałkowska 1",
        city: "Warsaw",
        postalCode: "00-001",
        password: "$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Ku", // "password" hashed
      },
    })

    // Create pets for the regular user
    const pets = await Promise.all([
      prisma.petProfile.create({
        data: {
          userId: regularUser.id,
          name: "Max",
          type: "DOG",
          weight: "16-25 kg",
          sex: "Male",
          age: "3",
        },
      }),
      prisma.petProfile.create({
        data: {
          userId: regularUser.id,
          name: "Luna",
          type: "CAT",
          weight: "<5 kg",
          sex: "Female",
          age: "2",
        },
      }),
    ])

    // Create system settings
    const settings = await Promise.all([
      prisma.setting.create({
        data: {
          key: "BUSINESS_HOURS_START",
          value: "08:00",
          description: "Business hours start time",
        },
      }),
      prisma.setting.create({
        data: {
          key: "BUSINESS_HOURS_END",
          value: "20:00",
          description: "Business hours end time",
        },
      }),
      prisma.setting.create({
        data: {
          key: "MIN_ADVANCE_BOOKING_DAYS",
          value: "1",
          description: "Minimum days in advance for booking",
        },
      }),
      prisma.setting.create({
        data: {
          key: "MAX_FUTURE_BOOKING_DAYS",
          value: "90",
          description: "Maximum days in the future for booking",
        },
      }),
      prisma.setting.create({
        data: {
          key: "WEEKEND_SURCHARGE_PERCENTAGE",
          value: "20",
          description: "Percentage surcharge for weekends and holidays",
        },
      }),
    ])

    return NextResponse.json({
      message: "Database seeded successfully",
      data: {
        services: services.length,
        holidays: holidays.length,
        users: 2,
        pets: pets.length,
        settings: settings.length,
      },
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 })
  }
}
