# Deployment Guide

This guide will help you deploy the MetaVR Dashboard to GitHub and Netlify.

## 🚀 GitHub Setup

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `metavr-dashboard` (or your preferred name)
3. Make it private or public as needed
4. Don't initialize with README (we already have one)

### 2. Push Code to GitHub

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: MetaVR Dashboard with auto-download"

# Add remote origin (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/metavr-dashboard.git

# Push to main branch
git push -u origin main
```

### 3. Set Up GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions

Add these secrets:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`

## 🌐 Netlify Setup

### 1. Create Netlify Account

1. Go to [Netlify](https://netlify.com)
2. Sign up with your GitHub account
3. Connect your GitHub account

### 2. Deploy from GitHub

1. Click "New site from Git"
2. Choose "GitHub" as provider
3. Select your `metavr-dashboard` repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Node version**: `18`

### 3. Environment Variables

In Netlify dashboard → Site settings → Environment variables, add:

```
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
FIREBASE_SERVICE_ACCOUNT_KEY=your-base64-encoded-service-account-json
NEXT_PUBLIC_APP_NAME=MetaVR Dashboard
NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
```

### 4. Get Netlify Tokens

1. Go to [Netlify User Settings](https://app.netlify.com/user/applications#personal-access-tokens)
2. Create a new personal access token
3. Add it to GitHub secrets as `NETLIFY_AUTH_TOKEN`
4. Get your site ID from Site settings → General → Site details
5. Add it to GitHub secrets as `NETLIFY_SITE_ID`

## 🔧 Firebase Configuration

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use existing
3. Enable Firestore Database
4. Enable Authentication
5. Get your Firebase config

### 2. Service Account Setup

1. Go to Project Settings → Service Accounts
2. Generate new private key
3. Download the JSON file
4. Convert to Base64:
   ```bash
   base64 -i firebase-service-account.json
   ```
5. Use the Base64 string as `FIREBASE_SERVICE_ACCOUNT_KEY`

### 3. Firestore Rules

Set up Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'moderator'];
    }
    
    // Requests collection
    match /requests/{requestId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'moderator'];
      allow create: if true; // Public access requests
    }
    
    // Applications collection
    match /applications/{appId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'moderator'];
    }
  }
}
```

## 🚀 Deployment Steps

### 1. Local Testing

```bash
# Test production build locally
npm run build
npm run start
```

### 2. Deploy to Netlify

#### Option A: Automatic (Recommended)
- Push to `main` branch
- GitHub Actions will automatically deploy to Netlify

#### Option B: Manual
- Go to Netlify dashboard
- Click "Deploy site" or trigger deploy manually

### 3. Verify Deployment

1. Check your Netlify site URL
2. Test all functionality:
   - Public access request form
   - Admin login
   - Dashboard features
   - API endpoints

## 🔍 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify Firebase configuration
   - Check Node.js version compatibility

2. **API Route Issues**
   - Ensure Netlify plugin is installed
   - Check function timeout settings
   - Verify Firebase service account

3. **Authentication Issues**
   - Verify Firebase project settings
   - Check domain configuration
   - Ensure service account has proper permissions

### Debug Commands

```bash
# Check build locally
npm run build

# Test production build
npm run start

# Check environment variables
npm run dev -- --env-file .env.local
```

## 📊 Monitoring

### Netlify Analytics
- Enable Netlify Analytics in site settings
- Monitor performance and usage

### Firebase Analytics
- Enable Firebase Analytics
- Track user interactions
- Monitor API usage

### Error Tracking
- Consider adding Sentry for error tracking
- Monitor build logs in Netlify
- Check GitHub Actions logs

## 🔄 Continuous Deployment

Once set up, the deployment process is automatic:

1. **Development**: Work on feature branches
2. **Testing**: Create pull requests
3. **Review**: Code review and testing
4. **Merge**: Merge to main branch
5. **Deploy**: Automatic deployment to Netlify

## 📝 Post-Deployment Checklist

- [ ] Site loads correctly
- [ ] Public access request form works
- [ ] Admin login functions
- [ ] Dashboard displays data
- [ ] API endpoints respond
- [ ] Firebase connection established
- [ ] Environment variables configured
- [ ] SSL certificate active
- [ ] Custom domain configured (if needed)
- [ ] Analytics tracking working

## 🆘 Support

If you encounter issues:
1. Check Netlify build logs
2. Review GitHub Actions logs
3. Verify Firebase configuration
4. Test locally first
5. Check environment variables
6. Review this guide

---

Happy deploying! 🚀
