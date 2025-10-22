# 🚀 Deployment Checklist

## ✅ Pre-Deployment (Completed)

- [x] **Project Cleanup**: Removed unnecessary files and documentation
- [x] **Auto-Download Setup**: Google Drive file download functionality
- [x] **Production Build**: Tested and working
- [x] **Firebase Configuration**: Environment variable support
- [x] **Netlify Configuration**: Complete deployment setup
- [x] **GitHub Actions**: CI/CD pipeline configured
- [x] **Documentation**: Comprehensive guides created

## 🔧 GitHub Setup (Next Steps)

### 1. Create Repository
```bash
# Run the setup script
./setup-github.sh

# Or manually:
git init
git add .
git commit -m "Initial commit: MetaVR Dashboard"
git remote add origin https://github.com/YOUR_USERNAME/metavr-dashboard.git
git push -u origin main
```

### 2. GitHub Secrets
Go to Repository → Settings → Secrets and variables → Actions

Add these secrets:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`

## 🌐 Netlify Deployment

### 1. Connect Repository
1. Go to [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Choose "GitHub" provider
4. Select your repository

### 2. Build Settings
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: `18`

### 3. Environment Variables
Add in Netlify dashboard:
```
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
FIREBASE_SERVICE_ACCOUNT_KEY=your-base64-encoded-json
NEXT_PUBLIC_APP_NAME=MetaVR Dashboard
NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
```

## 🔥 Firebase Setup

### 1. Project Configuration
1. Create Firebase project
2. Enable Firestore Database
3. Enable Authentication
4. Get Firebase config

### 2. Service Account
1. Go to Project Settings → Service Accounts
2. Generate new private key
3. Convert to Base64:
   ```bash
   base64 -i firebase-service-account.json
   ```
4. Use as `FIREBASE_SERVICE_ACCOUNT_KEY`

### 3. Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'moderator'];
    }
    
    match /requests/{requestId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'moderator'];
      allow create: if true;
    }
    
    match /applications/{appId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'moderator'];
    }
  }
}
```

## 🧪 Testing

### 1. Local Testing
```bash
# Test production build
npm run build
npm run start

# Test with auto-download
npm run dev:with-download
```

### 2. Deployment Testing
- [ ] Site loads correctly
- [ ] Public access request form works
- [ ] Admin login functions
- [ ] Dashboard displays data
- [ ] API endpoints respond
- [ ] Firebase connection established
- [ ] Auto-download works (if needed)

## 📊 Monitoring

### 1. Netlify Analytics
- Enable in site settings
- Monitor performance

### 2. Firebase Analytics
- Enable in Firebase console
- Track usage

### 3. Error Tracking
- Monitor build logs
- Check GitHub Actions logs

## 🔄 Continuous Deployment

Once set up:
1. **Development**: Work on feature branches
2. **Testing**: Create pull requests
3. **Review**: Code review process
4. **Merge**: Merge to main branch
5. **Deploy**: Automatic deployment via GitHub Actions

## 📋 Files Created

### Configuration Files
- `netlify.toml` - Netlify deployment configuration
- `.github/workflows/ci-cd.yml` - GitHub Actions pipeline
- `env.template` - Environment variables template
- `next.config.ts` - Updated Next.js configuration

### Documentation
- `README.md` - Comprehensive project documentation
- `DEPLOYMENT.md` - Detailed deployment guide
- `DOWNLOAD_SETUP.md` - Auto-download documentation
- `DEPLOYMENT_CHECKLIST.md` - This checklist

### Scripts
- `setup-github.sh` - GitHub setup helper script
- `scripts/download-file.ts` - Auto-download functionality
- `scripts/startup.ts` - Development startup script

## 🆘 Troubleshooting

### Common Issues
1. **Build Failures**: Check environment variables
2. **API Issues**: Verify Firebase configuration
3. **Auth Problems**: Check service account setup

### Debug Commands
```bash
# Check build locally
npm run build

# Test production
npm run start

# Check environment
npm run dev -- --env-file .env.local
```

## 🎉 Success Indicators

When everything is working:
- ✅ GitHub repository created and pushed
- ✅ Netlify site deployed successfully
- ✅ Firebase connection established
- ✅ All features working in production
- ✅ CI/CD pipeline active
- ✅ Monitoring set up

---

**Ready to deploy!** 🚀

Follow the steps above to get your MetaVR Dashboard live on the web.
