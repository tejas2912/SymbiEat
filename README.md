# SimbiEat - Food Ordering System for Hostel Canteens

SimbiEat is a comprehensive food ordering platform designed specifically for hostel canteens. It allows students to browse menus, place orders, and track deliveries, while providing canteen administrators with tools to manage food items, track orders, and analyze sales.

## Features

- **User Authentication**: Secure login and registration system
- **Food Menu**: Browse available food items with images, descriptions, and prices
- **Shopping Cart**: Add items to cart with quantity selection and special instructions
- **Order Placement**: Complete checkout with delivery information
- **Order Tracking**: Track order status from preparation to delivery
- **Admin Dashboard**: Manage food items, track orders, and view user statistics
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/simbieat.git
   cd simbieat
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a `.env.local` file in the root directory with the following variables:
   \`\`\`
   MONGODB_URI=mongodb://localhost:27017/simbieat
   NEXTAUTH_SECRET=your_nextauth_secret_key_here
   NEXTAUTH_URL=http://localhost:3000
   \`\`\`

4. Seed the database with initial data:
   \`\`\`bash
   npm run seed
   \`\`\`

5. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Access

To access the admin dashboard, use the following credentials:

- Email: admin@simbieat.com
- Password: admin123

## User Access

For regular user access, you can either register a new account or use:

- Email: user@simbieat.com
- Password: user123

## Project Structure

- `/app` - Next.js app router pages and API routes
- `/components` - Reusable UI components
- `/context` - React context providers
- `/lib` - Utility functions and database connection
- `/models` - MongoDB schemas
- `/public` - Static assets and uploaded images

## New Features

- **Special Instructions**: Users can now add special instructions for each food item
- **Enhanced Quantity Selection**: Improved UI for selecting item quantities
- **Admin User Management**: View all users with order statistics
- **Improved Food Item Management**: List view for easier management of food items

## License

This project is licensed under the MIT License - see the LICENSE file for details.
\`\`\`

## 16. Create a .gitkeep file for the uploads directory:

```plaintext file="public/uploads/.gitkeep"
# This directory is used to store uploaded food item images
# The .gitkeep file ensures the directory is included in git
