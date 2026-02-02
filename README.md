# CSR Employee Activity Tracker

A mobile-first internal application for employees to log daily CSR outreach calls to colleges, with admin tracking and analytics support.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, shadcn/ui components
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL with Row Level Security
- **ORM**: Prisma (server-side only)
- **Forms**: React Hook Form + Zod validation

## Getting Started

### 1. Prerequisites

- Node.js 18+
- A Supabase project (create one at [supabase.com](https://supabase.com))

### 2. Environment Setup

Copy `.env.local` and fill in your Supabase credentials:

```bash
# Get these from your Supabase project dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Service role key (Settings > API > service_role key)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database URLs (Settings > Database > Connection string)
# Use Transaction Pooler for DATABASE_URL
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true

# Use Direct connection for DIRECT_URL
DIRECT_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

### 3. Database Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio
npx prisma studio
```

### 4. Row Level Security

After pushing the schema, run the RLS policies in your Supabase SQL Editor:

1. Go to Supabase Dashboard > SQL Editor
2. Open and run `supabase/rls-policies.sql`

### 5. Create Test Users

In Supabase Dashboard > Authentication > Users, create employee accounts:

1. Click "Add user" > "Create new user"
2. Enter email and password
3. (Optional) Add user metadata: `{"name": "Employee Name"}`

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── actions/        # Server actions (Prisma operations)
│   │   ├── auth.ts
│   │   └── leads.ts
│   ├── auth/           # Auth callback route
│   ├── dashboard/      # Main dashboard page
│   ├── login/          # Login page
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── dashboard/      # Dashboard-specific components
│   │   ├── add-lead-form.tsx
│   │   ├── dashboard-client.tsx
│   │   ├── date-selector.tsx
│   │   ├── floating-action-button.tsx
│   │   ├── header.tsx
│   │   ├── lead-card.tsx
│   │   └── leads-list.tsx
│   └── ui/             # Reusable UI components
│
├── lib/
│   ├── supabase/       # Supabase clients
│   │   ├── client.ts
│   │   ├── middleware.ts
│   │   └── server.ts
│   ├── prisma.ts
│   ├── types.ts
│   ├── utils.ts
│   └── validations.ts
│
prisma/
├── schema.prisma       # Database schema
│
supabase/
└── rls-policies.sql    # Row Level Security policies
```

## Features

- ✅ Employee login via Supabase Auth
- ✅ Mobile-first, thumb-friendly UI
- ✅ Horizontal date selector
- ✅ Add CSR leads with full form
- ✅ Tab navigation (Today's Leads, Follow-ups, Completed)
- ✅ Status badges (Interested, Call Later, Not Interested)
- ✅ Past dates are read-only
- ✅ Row Level Security for data isolation
- ✅ Prisma-ready schema for admin analytics

## Security Notes

- Supabase RLS ensures employees can only access their own data
- Prisma runs server-side only (Next.js Server Actions)
- The service role key is never exposed to the client
- Authentication is handled entirely by Supabase

## Future Enhancements (Admin Dashboard)

The Prisma schema supports these analytics queries:

```typescript
// Calls per day by employee
prisma.lead.groupBy({
  by: ["employeeId", "date"],
  _count: true,
});

// Slots confirmed
prisma.lead.count({
  where: { slotRequested: true, slotDate: { not: null } },
});

// Follow-ups pending
prisma.lead.count({
  where: { responseStatus: "CALL_LATER" },
});
```

## License

Internal use only.
