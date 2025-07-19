# 🎨 Customization Guide for Kairos v2.0

This guide will help you adapt Kairos v2.0 for your own business event discovery platform or similar use case.

## 🎯 Quick Customization Checklist

### 1. **Branding & Domain Changes**
- [ ] Change "Kairos v2.0" to your brand name
- [ ] Update main heading and description
- [ ] Modify color scheme and styling
- [ ] Update favicon and logos

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

### **Step 1: Change Branding**

#### Frontend Branding Changes:

**1. Main App Title**
```typescript
// client/src/App.tsx
<h1>Your Brand Name</h1> // Change from "Kairos v2.0"
```

**2. Homepage Heading**
```typescript
// client/src/pages/home.tsx
<h1 className="text-5xl font-bold text-slate-900 mb-4">
  Your Custom Heading Here
</h1>
<p className="text-lg text-slate-600 mb-12">
  Your custom description here
</p>
```

**3. Color Scheme**
```typescript
// client/tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          // Your brand colors
          500: '#your-color',
          600: '#your-color',
        }
      }
    }
  }
}
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

### **Step 5: Customize UI Components**

#### Event Card Layout:
```typescript
// client/src/components/EventCard.tsx
// Modify the card layout to show your custom fields
<div className="mb-2">
  <span className="block text-xs text-gray-400">Your Custom Field:</span>
  <span className="text-sm">{event.customField}</span>
</div>
```

#### Search Interface:
```typescript
// client/src/components/SearchSection.tsx
// Add custom search fields
<Input
  type="text"
  placeholder="Your custom search placeholder"
  className="pl-12 pr-4 py-4 text-lg rounded-xl"
  value={customField}
  onChange={e => setCustomField(e.target.value)}
/>
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
- Keep current structure
- Add event registration features
- Include event management dashboard

### **Networking Platform**
- Add user profiles
- Include messaging features
- Add event RSVP functionality

### **Business Directory**
- Add company profiles
- Include contact information
- Add review/rating system

### **Conference Management**
- Add speaker profiles
- Include session scheduling
- Add ticket management

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