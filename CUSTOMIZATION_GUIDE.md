# 🎨 Customization Guide for Kairos v2.0

This guide will help you adapt Kairos v2.0 for your own business event discovery platform or similar use case.

## 🎯 Quick Customization Checklist

### 1. **Backend Integration**
- [ ] Set up PostgreSQL database
- [ ] Configure environment variables
- [ ] Test API endpoints
- [ ] Import your event data

### 2. **Event Categories**
- [ ] Customize industry categories
- [ ] Modify company readiness levels
- [ ] Adjust filtering logic

### 3. **Freemium Model**
- [ ] Set blurring limits for free users
- [ ] Configure premium features
- [ ] Customize payment flow

### 4. **Data Structure**
- [ ] Modify event fields
- [ ] Update user management
- [ ] Adjust authentication

---

## 🔧 Detailed Customization Steps

### **Step 1: Backend Integration**

#### Database Setup:

**1. Configure Database**
```bash
# Set up PostgreSQL database (Neon recommended)
# Update .env with your DATABASE_URL
DATABASE_URL=your_postgresql_connection_string
```

**2. Run Migrations**
```bash
cd server
npm run db:migrate
```

**3. Test API Endpoints**
```bash
# Test the events endpoint
curl http://localhost:5002/api/events

# Test with filters
curl "http://localhost:5002/api/events?industry=Technology"
```

**4. Import Your Data**
```typescript
// Use the existing CSV parser or create your own
// client/src/lib/csvParser.ts - Modify for your data format
```

### **Step 2: Customize Event Categories**

#### Industry Categories:
```typescript
// client/src/components/SearchSection.tsx
const industries = [
  'All industries',
  'Your Industry 1',
  'Your Industry 2',
  'Your Industry 3',
  // Add your industries
];
```

#### Company Readiness Levels:
```typescript
// client/src/components/SearchSection.tsx
const newCompanyStageOptions = [
  "All categories",
  "🔥 Your Category 1 (description)",
  "🔍 Your Category 2 (description)",
  "📋 Your Category 3 (description)"
];
```

#### Update Mapping Logic:
```typescript
// client/src/lib/dataMapper.ts
export function mapCompanyStageToReadiness(oldStages: string[]): string {
  // Update the mapping logic for your categories
  if (oldStages.some(stage => ['Your Stage 1', 'Your Stage 2'].includes(stage))) {
    return '🔥 Your Category 1 (description)';
  }
  // Add more mappings...
}
```

### **Step 3: Modify Freemium Model**

#### Adjust Blurring Limits:
```typescript
// client/src/components/FeaturedEvents.tsx
// Change the number of visible events for free users
blurred={index >= 3 && !hasAccess} // Shows 3 events for free users
```

```typescript
// client/src/components/SearchResults.tsx
// Adjust filtered state visibility
if (isDefaultState) {
  shouldBlur = index >= 3; // Show 3 events in default state
} else {
  shouldBlur = index >= 1; // Show 1 event in filtered state
}
```

#### Customize Premium Features:
```typescript
// client/src/lib/authUtils.ts
export const hasFullAccess = (
  userEmail: string,
  userPhone: string,
  premiumUsers: PremiumUser[] = []
): boolean => {
  // Add your premium user logic
  return premiumUsers.some(user =>
    user.email === userEmail && user.status === 'active'
  );
};
```

### **Step 4: Update Data Structure**

#### Modify Event Schema:
```typescript
// shared/schema.ts
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  eventName: varchar("event_name", { length: 255 }).notNull(),
  dateLocation: text("date_location").notNull(),
  attendeeTypes: text("attendee_types").notNull(),
  goalsServed: varchar("goals_served", { length: 255 }).notNull(),
  sourceUrl: text("source_url"),
  industry: varchar("industry", { length: 100 }).notNull(),
  companyStages: text("company_stages").array().notNull(),
  // Add your custom fields here
  customField: varchar("custom_field", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});
```

#### Update TypeScript Interfaces:
```typescript
// client/src/lib/types.ts
export interface Event {
  id: string;
  eventName: string;
  dateLocation: string;
  attendees: string;
  goals: string;
  sourceUrl: string;
  primaryIndustry: string;
  secondaryIndustry?: string;
  companyStages: string[];
  companyReadiness: string;
  eventType: string;
  featured: boolean;
  // Add your custom fields
  customField?: string;
}
```

### **Step 5: Core Functionality Integration**

#### Search & Filtering Logic:
```typescript
// client/src/lib/eventFilters.ts
// Core filtering logic - adapt for your data structure
export function filterEvents(events: Event[], filters: SearchFilters): Event[] {
  return events.filter(event => {
    // Your custom filtering logic here
    const matchesQuery = !filters.query || 
      event.eventName.toLowerCase().includes(filters.query.toLowerCase());
    
    const matchesIndustry = filters.industry === 'All industries' || 
      event.primaryIndustry === filters.industry;
    
    return matchesQuery && matchesIndustry;
  });
}
```

#### Freemium Model Logic:
```typescript
// client/src/lib/authUtils.ts
// Premium user detection - customize for your user system
export const hasFullAccess = (
  userEmail: string,
  userPhone: string,
  premiumUsers: PremiumUser[] = []
): boolean => {
  // Your premium user logic here
  return premiumUsers.some(user =>
    user.email === userEmail && user.status === 'active'
  );
};
```

---

## 🚀 Deployment Customization

### Environment Variables:
```bash
# .env
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=production
PORT=5002
```

### Build Scripts:
```json
// package.json
{
  "scripts": {
    "build": "cd client && npm run build && cd ../server && npm run build",
    "start": "cd server && npm start"
  }
}
```

---

## 📋 Common Use Cases

### **Event Discovery Platform**
- Use the existing search and filtering system
- Adapt the event data structure for your events
- Integrate the freemium model for monetization

### **Networking Platform**
- Use the user authentication system
- Adapt the event structure for networking events
- Integrate the premium user logic

### **Business Directory**
- Use the search and filtering for business listings
- Adapt the data structure for company profiles
- Use the freemium model for premium listings

### **Conference Management**
- Use the event structure for conference sessions
- Adapt the filtering for different session types
- Integrate the premium access for VIP sessions

---

## 🔍 Troubleshooting

### Common Issues:

**1. Database Connection Issues**
- Check `DATABASE_URL` in `.env`
- Ensure database is accessible
- Verify schema migrations

**2. Build Errors**
- Clear `node_modules` and reinstall
- Check TypeScript compilation
- Verify all dependencies

**3. Runtime Errors**
- Check browser console for frontend errors
- Check server logs for backend errors
- Verify API endpoints

---

## 📞 Need Help?

1. Check the main README.md for setup instructions
2. Review the existing code structure
3. Test changes incrementally
4. Use TypeScript for type safety

**Remember:** This project is designed to be modular and customizable. Start with small changes and test frequently! 