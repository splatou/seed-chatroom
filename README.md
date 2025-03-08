# The Seed Chatroom

A simple real-time chatroom for guests of The Seed hotel. This application allows guests to communicate with each other about activities and locations within the property.

## Features

- Real-time messaging
- User identification
- Message history with timestamps
- Admin functionality to clear chat history between guest groups
- Mobile-responsive design

## Setup

1. Create a Supabase account and project
2. Run the SQL from `supabase/setup.sql` in the Supabase SQL editor
3. Copy your Supabase URL and anon key to the `.env` file
4. Install dependencies: `npm install`
5. Start the development server: `npm start`

## Admin Access

- Click the "Admin" link in the top right corner
- Enter the password (default: theseed2025)
- As an admin, you can clear all messages for new guest groups

## Deployment

1. Build the project: `npm run build`
2. Deploy to your hosting platform of choice

## Technologies Used

- React with TypeScript
- Supabase (PostgreSQL + real-time subscriptions)
- Tailwind CSS
