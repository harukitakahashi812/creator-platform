This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Variables

Create a `.env.local` file in the root of the project with the following content:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-your_openai_api_key_here
```

**Setup Instructions:**
1. Create a Firebase project and add your configuration
2. Set up Stripe account and add your test keys
3. Get an OpenAI API key and add it to the environment variables

## Features

- **User Authentication**: Firebase Authentication with email/password
- **Project Submission**: Submit creative projects with Google Drive or Gumroad links
- **AI Verification**: OpenAI GPT-4 verifies project quality and completeness
- **Payment Integration**: Stripe checkout and Gumroad payment options
- **Project Management**: Dashboard for creators to manage their projects
- **Public Browse**: Browse and purchase approved projects
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Vercel Notes

- Ensure environment variables are configured in Vercel (Firebase, Stripe, OpenAI).
- Puppeteer-based API route `src/app/api/gumroad/connect/route.ts` explicitly opts into Node.js runtime and dynamic rendering on Vercel.
- The build targets Node 18+ (see `engines` in `package.json`).
