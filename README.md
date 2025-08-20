# Creator Platform - Complete Project Management System

A modern, AI-powered platform for creators to submit projects, get verified, and earn funding through offerwalls before publishing to Gumroad.

## 🚀 Features

### For Creators
- **Project Submission**: Submit projects with deadlines and descriptions
- **File Upload**: Upload project files or add Google Drive links
- **AI Verification**: Automatic project quality verification using GPT-4
- **Offerwall Integration**: Earn money through surveys, app installs, and offers
- **Funding Progress**: Track earnings towards your project goal
- **Auto-Publishing**: Automatic Gumroad publishing when funding target is reached

### For Admins
- **Admin Dashboard**: Manage all projects and oversee workflow
- **Project Review**: Approve/reject projects after AI verification
- **Status Management**: Track project progress through all stages
- **Funding Monitoring**: Monitor offerwall earnings and project funding

## 🔄 Complete Workflow

### 1. Project Submission
1. Creator submits project with title, description, type, price, and deadline
2. Project status: `pending`

### 2. File Upload
1. Creator uploads project files or adds Google Drive link
2. System marks project as `hasFiles: true`

### 3. AI Verification
1. Creator clicks "Submit for AI Verification"
2. GPT-4 analyzes project quality and completeness
3. Project status changes to `approved` or `rejected`

### 4. Offerwall Funding (if approved)
1. Creator opens offerwall to complete offers
2. Earn money through surveys, app installs, signups
3. Earnings automatically tracked in `fundedAmount`
4. Progress bar shows funding status

### 5. Auto-Publishing (when funded)
1. When `fundedAmount >= price`, project status becomes `funded`
2. System automatically publishes to Gumroad
3. Creator receives Gumroad link

## 🛠️ Technical Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Firebase
- **Database**: Firestore
- **Authentication**: Firebase Auth
- **AI**: OpenAI GPT-4
- **Hosting**: Vercel (main app) + VPS (Gumroad worker)
- **Offerwall**: Clixwall integration

## 📁 Project Structure

```
creator-platform/
├── src/
│   ├── app/
│   │   ├── admin/           # Admin dashboard
│   │   ├── dashboard/       # User dashboard
│   │   ├── project/[id]/    # Individual project page
│   │   ├── offerwall/       # Offerwall integration
│   │   └── api/             # API routes
│   ├── components/          # React components
│   └── lib/                 # Firebase, Stripe, etc.
├── gumroad-worker/          # VPS worker for Gumroad automation
└── README.md
```

## 🚀 Deployment

### Main App (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   OPENAI_API_KEY=...
   STRIPE_SECRET_KEY=...
   STRIPE_PUBLISHABLE_KEY=...
   ```

### Gumroad Worker (VPS)
1. Deploy to Ubuntu VPS
2. Install dependencies: `npm ci --include=dev`
3. Set environment variables:
   ```
   GUMROAD_EMAIL=...
   GUMROAD_PASSWORD=...
   GUMROAD_WORKER_TOKEN=...
   ```
4. Run with PM2: `pm2 start npm --name "gumroad-worker" -- run worker`

## 🔑 Environment Variables

### Required for Main App
- `NEXT_PUBLIC_FIREBASE_*`: Firebase configuration
- `OPENAI_API_KEY`: OpenAI API key for AI verification
- `STRIPE_*`: Stripe payment processing

### Required for VPS Worker
- `GUMROAD_EMAIL`: Gumroad account email
- `GUMROAD_PASSWORD`: Gumroad account password
- `GUMROAD_WORKER_TOKEN`: Security token for worker communication

## 📱 Usage Guide

### For Creators
1. **Sign up/Login**: Create account or sign in
2. **Submit Project**: Fill out project form with details
3. **Upload Files**: Add project files or Google Drive link
4. **Get Verified**: Submit for AI verification
5. **Earn Funding**: Complete offers through offerwall
6. **Publish**: Project automatically publishes when funded

### For Admins
1. **Access Admin Panel**: Navigate to `/admin`
2. **Review Projects**: See all pending projects
3. **Manage Status**: Approve/reject projects
4. **Monitor Progress**: Track funding and completion

## 🔒 Security Features

- Firebase Authentication
- API route protection
- Worker token verification
- Input validation and sanitization
- Rate limiting on API endpoints

## 🚧 Development

### Local Development
```bash
npm install
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### Worker Development
```bash
cd gumroad-worker
npm install
npm run dev
```

## 📊 Project Statuses

- `pending`: Project submitted, waiting for files and verification
- `approved`: AI verification passed, ready for funding
- `rejected`: AI verification failed, needs revision
- `funded`: Funding target reached, published to Gumroad

## 💡 Tips for Success

### For Creators
- Provide detailed project descriptions
- Upload high-quality project files
- Complete offers honestly for better approval rates
- Check back daily for new high-paying offers

### For Admins
- Monitor project quality through AI verification
- Review rejected projects for improvement opportunities
- Track funding progress across all projects
- Ensure smooth workflow from submission to publication

## 🆘 Support

For technical issues or questions:
1. Check the admin dashboard for project status
2. Review Firebase console for database issues
3. Check VPS logs for worker problems
4. Verify environment variables are set correctly

## 🔄 Updates

The system automatically:
- Tracks offerwall earnings
- Updates project funding progress
- Publishes projects when funded
- Manages project lifecycle

---

**Built with ❤️ for creators who want to monetize their projects through community engagement and offer completion.**
