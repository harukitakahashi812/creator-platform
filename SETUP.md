# 🚀 Setup Guide

## Environment Configuration

You need to create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Gumroad Configuration
NEXT_PUBLIC_GUMROAD_PRODUCT_ID=your_gumroad_product_id
```

## Google Drive Link Format

**❌ Wrong format:**
```
https://drive.google.com/drive/my-drive?dmr=1&ec=wgc-drive-globalnav-goto
```

**✅ Correct format:**
```
https://drive.google.com/file/d/FILE_ID/view
```

### How to get the correct link:
1. Upload your file to Google Drive
2. Right-click on the file
3. Select "Get link"
4. Copy the link that looks like: `https://drive.google.com/file/d/1ABC123DEF456/view`

## Current Issues Fixed:
- ✅ Dropdown arrow positioning
- ✅ Form validation for Google Drive links
- ✅ Better error handling
- ✅ Helpful instructions for users

## Next Steps:
1. Create `.env.local` file with your API keys
2. Restart the development server
3. Test the form submission 