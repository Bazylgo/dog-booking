# Dog Hotel Reservation System

This project is a comprehensive reservation system for a dog hotel, allowing users to book various pet services including overnight stays, walks, and home visits.

## Features

- User registration and profile management
- Pet profile management
- Multiple service types (Nocleg, Spacer, Wyzyta Domowa)
- Calendar-based reservation system
- Multiple time slots per day for services
- Cost calculation based on service type, duration, number of pets, and special days
- Distance calculation for services at client locations
- Admin panel for managing services, pricing, and holidays
- User dashboard for viewing and modifying bookings
- Chat support system

## Database Setup

This project uses Prisma with a PostgreSQL database (Neon). Follow these steps to set up your database:

1. Create a Neon database at [neon.tech](https://neon.tech)
2. Add your database connection string to the `.env` file:
   \`\`\`
   DATABASE_URL="postgresql://username:password@your-neon-db-host/dbname"
   \`\`\`
3. Run Prisma migrations:
   \`\`\`bash
   npx prisma migrate dev --name init
   \`\`\`
4. Seed the database with initial data:
   \`\`\`bash
   npx ts-node lib/setup-database.ts
   \`\`\`
   
Alternatively, you can use the API route to seed the database:
\`\`\`bash
curl -X POST http://localhost:3000/api/seed
\`\`\`

## Getting Started

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Set up your environment variables in `.env`
4. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/app` - Next.js app router pages and components
- `/components` - Reusable UI components
- `/lib` - Utility functions and database client
- `/prisma` - Prisma schema and migrations

## Key Components

- **Reservation Form**: Multi-step form for booking services
- **Pet Profiles**: Management of pet information
- **Calendar**: Date selection with holiday highlighting
- **Multi-Time Selector**: Select multiple time slots per day
- **Cost Breakdown**: Detailed pricing calculation
- **Chat Widget**: Real-time support chat
- **Admin Settings**: Service and pricing management
- **User Bookings**: View and modify existing reservations

## Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## Database Schema

The database follows a star schema design with:
- Users at the center
- Related entities: PetProfiles, Reservations, Services
- Junction tables: ReservationPet, ServiceDate, ServiceTime
- Supporting entities: Payment, Note, Message, Holiday, Setting

## Transparency and User Experience

The application prioritizes transparency by:
- Showing clear pricing breakdowns
- Highlighting surcharges and special rates
- Providing immediate feedback on user actions
- Offering a chat support system
- Allowing users to view and modify their bookings
- Clearly explaining all pricing factors

## Future Enhancements

- Authentication with NextAuth.js
- Email notifications for bookings
- Payment integration
- Staff scheduling system
- Loyalty program
\`\`\`

Now let me explain how I've addressed your specific requests:

1. **Multiple service times per day**: I've implemented a `MultiTimeSelector` component that allows users to add multiple time slots for each selected date. Each time slot can be individually managed.

2. **Different service times for different days**: The new implementation stores times separately for each date, allowing for complete customization of service times per day.

3. **Chat feature**: I've added a `ChatWidget` component that provides a floating chat interface for users to communicate with support staff.

4. **Transparency**: The system now shows pricing information at the top of the page, provides detailed breakdowns, and clearly explains all surcharges. The chat widget also enhances transparency by providing direct communication.

5. **Responsive design**: I've improved the responsive design with proper grid layouts, stacking on mobile, and appropriate text sizing.

6. **Database integration**: I've provided a complete Prisma schema, database setup instructions, and API routes for integration with Neon database.

7. **Saved profiles in database**: The schema includes tables for storing user profiles and pet profiles, with API routes for retrieval.

8. **Load profile button**: I've added a dedicated "Load Profile" button next to the "Save Profile" button.

9. **Strategic Save button placement**: The Save button is now more prominently positioned and appears in multiple relevant locations.

10. **Database schema design**: I've implemented a star schema design with the User entity at the center, connected to Reservations, PetProfiles, and other entities.

11. **History tables**: The schema includes tables for tracking reservation history, payments, and notes.

12. **Service prices in database**: Services and their prices are stored in the database and can be managed through the admin interface.

13. **Cost visibility**: The total cost is now displayed at the top of the page and is always visible.

14. **Admin settings**: I've created a comprehensive admin settings page for managing services, pricing, holidays, and system settings.

15. **User booking management**: I've added a bookings page where users can view and modify their reservations.

16. **Reservation summary improvements**: The summary now shows all selected dates with their times and maintains a count of selected days.

17. **Holiday pricing calculation**: The cost calculation has been updated to properly account for holidays and weekends.

18. **Duration multiplier refactoring**: The duration calculation has been improved to handle additional time slots more accurately.

To get started with this system:

1. Set up your Neon database and add the connection string to your environment variables
2. Run the Prisma migrations to create the database schema
3. Use the seed script to populate initial data
4. Start the application and begin using the reservation system

The system is now more user-friendly, transparent, and robust, with proper database integration and improved functionality.
