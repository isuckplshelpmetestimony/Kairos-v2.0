# Kairos v2.0 - Business Event Discovery Platform

A web platform that helps digital transformation companies discover business events where their target clients attend. Built with React, Node.js, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/isuckplshelpmetestimony/Kairos-v2.0.git
cd Kairos-v2.0
```

2. **Install dependencies**
```bash
# Install client dependencies
cd client && npm install

# Install server dependencies  
cd ../server && npm install

# Install shared dependencies
cd .. && npm install
```

3. **Set up environment variables**
```bash
# Copy the env file
cp env .env

# Edit .env with your database credentials
DATABASE_URL=your_postgresql_connection_string
```

4. **Set up the database**
```bash
# Run database migrations
cd server && npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

5. **Start the development servers**
```bash
# Terminal 1: Start the backend server
cd server && npm run dev

# Terminal 2: Start the frontend client  
cd client && npm run dev
```

The app will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
Kairos-v2.0/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and types
│   │   ├── contexts/      # React contexts
│   │   └── data/          # Data loading
├── server/                 # Node.js backend
│   ├── routes/            # API endpoints
│   ├── middleware/        # Express middleware
│   ├── database/          # Database schemas
│   └── utils/             # Backend utilities
├── shared/                # Shared types and schemas
└── scripts/               # Utility scripts
```

## 🔧 Customization Guide

### For Your Own Version

This project is designed to be easily customizable for different use cases. Here's how to adapt it:

#### 1. **Change the Domain/Branding**

**Frontend Changes:**
- Update `client/src/App.tsx` - Change "Kairos v2.0" to your brand name
- Update `client/src/pages/home.tsx` - Modify the main heading and description
- Update `client/src/components/Header.tsx` - Change the header branding

**Backend Changes:**
- Update API endpoints in `server/routes.ts` if needed
- Modify database schema in `shared/schema.ts` for your data structure

#### 2. **Customize Event Categories**

**Industry Categories:**
- Edit `client/src/components/SearchSection.tsx` - Modify the `industries` array
- Update the database schema if you need different industry fields

**Company Readiness Levels:**
- Edit `client/src/components/SearchSection.tsx` - Modify `newCompanyStageOptions`
- Update `client/src/lib/dataMapper.ts` - Adjust the mapping logic
- Update `client/src/lib/eventFilters.ts` - Modify filtering logic

#### 3. **Modify the Freemium Model**

**Blurring Logic:**
- `client/src/components/FeaturedEvents.tsx` - Adjust how many events are shown for free users
- `client/src/components/SearchResults.tsx` - Modify the conditional blurring logic

**Premium Features:**
- `client/src/lib/authUtils.ts` - Customize premium user detection
- `client/src/components/PaymentPage.tsx` - Modify payment flow

#### 4. **Data Structure**

**Event Data:**
- `shared/schema.ts` - Modify the events table schema
- `client/src/lib/types.ts` - Update TypeScript interfaces
- `client/src/data/events.ts` - Adjust data loading logic

**User Management:**
- `server/routes/auth.js` - Customize authentication
- `server/routes/users.js` - Modify user management

#### 5. **Styling and UI**

**Theme:**
- `client/tailwind.config.ts` - Customize colors and styling
- `client/src/index.css` - Modify global styles
- `client/src/components/ui/` - Update component styles

**Layout:**
- `client/src/components/EventCard.tsx` - Modify event card layout
- `client/src/components/SearchSection.tsx` - Adjust search interface

## 📊 Key Features

### Core Functionality
- **Event Search & Filtering** - Search by keywords, industry, and company stage
- **Freemium Model** - Free users see limited events, premium users see all
- **Responsive Design** - Works on desktop and mobile
- **Real-time Filtering** - Instant search results

### Technical Features
- **TypeScript** - Full type safety
- **PostgreSQL** - Robust database with Drizzle ORM
- **React 18** - Modern frontend with hooks
- **Express.js** - RESTful API backend
- **Tailwind CSS** - Utility-first styling

## 🔌 API Endpoints

### Events
- `GET /api/events` - Get all events with optional filtering
- `GET /api/events/featured` - Get featured events
- `POST /api/events` - Create new event

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
# Deploy the dist/ folder
```

### Backend (Railway/Render)
```bash
cd server
npm run build
# Deploy with environment variables
```

### Database
- Use Neon, Railway, or any PostgreSQL provider
- Set `DATABASE_URL` environment variable

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues:
1. Check the existing issues
2. Create a new issue with detailed description
3. Contact the maintainers

---

**Built with ❤️ for strategic networking** 