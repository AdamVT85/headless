# Sanity Studio CMS - Access Guide

## Current Status

✅ **Sanity Studio Route Created**: `/studio`
✅ **Project Connected**: VT (pdwmpvsr)
✅ **Environment Variables Updated**
✅ **Schemas Configured**: About Page, Essential Info, Destinations, Regions

## Quick Access

### Studio URL (After Dev Server Restart)
```
http://localhost:3001/studio
```

### Sanity Management Dashboard
```
https://www.sanity.io/manage/project/pdwmpvsr
```

## Setup Complete! Next Steps

### Step 1: Restart Dev Server

The environment variables have been updated, so you need to restart the dev server:

1. **Stop the current dev server**:
   - Press `Ctrl+C` in the terminal running `npm run dev`

2. **Start it again**:
   ```bash
   npm run dev
   ```

3. **Wait for it to compile** (should take 2-3 seconds)

### Step 2: Access Sanity Studio

Once the dev server is running, navigate to:
```
http://localhost:3001/studio
```

### Step 3: Login

When you first access the studio, you'll be prompted to log in:

1. **Click "Login"** or "Sign in with Sanity"
2. You'll be redirected to: `https://api.sanity.io/v1/auth/login`
3. **Choose your authentication method**:
   - Google Account
   - GitHub Account
   - Email/Password

4. **Authorize the application**
5. You'll be redirected back to: `http://localhost:3001/studio`
6. **Studio will load** - you're now logged in!

## What You Can Do in Sanity Studio

### Content Types Available

1. **About Page** (Singleton)
   - Edit the About page content
   - Add team members, company history, etc.

2. **Essential Information** (Singleton)
   - Travel information
   - FAQs
   - Booking terms and conditions

3. **Destinations** (Multiple)
   - Create and manage destination pages
   - Add descriptions, images, highlights

4. **Regions** (Multiple)
   - Define geographic regions
   - Link to destinations
   - Add region-specific content

### Studio Features

- **Visual Editor**: Rich text editing with real-time preview
- **Media Library**: Upload and manage images
- **Document Versioning**: Track changes and revisions
- **Publishing Workflow**: Draft → Review → Publish
- **Search & Filter**: Find content quickly
- **GROQ Playground** (Vision Tool): Query your content

## Project Configuration

### Project Details
- **Name**: VT
- **Project ID**: `pdwmpvsr`
- **Dataset**: `production`
- **Members**: 2 users currently have access

### Manage Project Settings

Visit the management dashboard to:
- Add/remove team members
- Configure CORS settings
- Manage API tokens
- Set up webhooks
- Configure datasets

```
https://www.sanity.io/manage/project/pdwmpvsr
```

## Adding Team Members

To give someone access to the CMS:

### Option 1: Via Sanity Dashboard (Recommended)

1. Go to: https://www.sanity.io/manage/project/pdwmpvsr
2. Click **"Members"** in the left sidebar
3. Click **"Invite member"**
4. Enter their email address
5. Choose their role:
   - **Administrator**: Full access to everything
   - **Developer**: Can manage code and data
   - **Editor**: Can edit content only
   - **Viewer**: Read-only access
6. Click **"Send invitation"**
7. They'll receive an email with login instructions

### Option 2: Via CLI

```bash
npx sanity users invite --project pdwmpvsr --role editor user@example.com
```

## CORS Configuration (Important!)

For the Studio to work properly, you need to allow your domain:

1. Go to: https://www.sanity.io/manage/project/pdwmpvsr/api
2. Click **"CORS Origins"**
3. Click **"Add CORS origin"**
4. Add these origins:
   ```
   http://localhost:3001
   http://localhost:3000
   https://yourdomain.com (production domain when deployed)
   ```
5. Check **"Allow credentials"**
6. Click **"Save"**

## Troubleshooting

### Issue: Studio Page Shows 404

**Solution**: Make sure you restarted the dev server after updating `.env.local`

```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Issue: "Invalid Project ID" Error

**Solution**: Verify the project ID in `.env.local`:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=pdwmpvsr
```

### Issue: "Unauthorized" or CORS Error

**Solution**: Add your domain to CORS settings (see CORS Configuration above)

### Issue: Changes Not Appearing

**Solution**: Remember that Sanity content needs to be:
1. **Saved** (draft)
2. **Published** (live)

Draft content won't appear on the frontend until published.

### Issue: Can't Login

**Solution**:
1. Clear browser cache and cookies
2. Try incognito/private mode
3. Use a different authentication method (Google vs GitHub)
4. Check you have permission on the project

## Development Workflow

### Editing Content

1. **Navigate to Studio**: http://localhost:3001/studio
2. **Select a document type** from the left sidebar
3. **Create or edit** a document
4. **Save** your changes (creates a draft)
5. **Publish** when ready (makes it live)

### Schema Changes

If you need to modify the content structure:

1. Edit schema files in: `sanity/schemas/`
2. The dev server will auto-reload
3. Studio will update automatically
4. Deploy schema changes: `npx sanity deploy`

## Production Deployment

### Deploy Studio to Sanity Hosting (Optional)

You can host the Studio on Sanity's servers:

```bash
npx sanity deploy
```

This will give you a URL like: `https://your-project.sanity.studio`

### Deploy Studio with Your Next.js App (Current Setup)

The Studio is embedded in your Next.js app at `/studio`, so when you deploy your Next.js app, the Studio will be deployed with it.

Make sure to:
1. Add production domain to CORS settings
2. Set environment variables in your hosting platform
3. Test authentication in production

## Useful Commands

```bash
# List all projects
npx sanity projects list

# List datasets
npx sanity dataset list

# Create a new dataset
npx sanity dataset create staging

# Manage project in browser
npx sanity manage

# Check Sanity version
npx sanity --version

# Deploy Studio to Sanity hosting
npx sanity deploy

# Export dataset
npx sanity dataset export production backup.tar.gz

# Import dataset
npx sanity dataset import backup.tar.gz production
```

## Security Best Practices

1. **Use Roles**: Assign appropriate roles (don't make everyone an admin)
2. **Token Management**: Use read tokens for public data, write tokens only in backend
3. **CORS**: Only allow trusted domains
4. **Environment Variables**: Never commit `.env.local` to Git (it's already in `.gitignore`)
5. **Regular Audits**: Review team members and remove inactive users

## Support & Documentation

- **Sanity Documentation**: https://www.sanity.io/docs
- **Schema Documentation**: https://www.sanity.io/docs/schema-types
- **Studio Docs**: https://www.sanity.io/docs/sanity-studio
- **GROQ Query Language**: https://www.sanity.io/docs/groq
- **Community Slack**: https://slack.sanity.io

---

## Quick Start Checklist

- [x] Sanity Studio route created at `/studio`
- [x] Environment variables configured
- [x] Project connected (pdwmpvsr)
- [ ] **Restart dev server** (npm run dev)
- [ ] **Access Studio**: http://localhost:3001/studio
- [ ] **Login** with Google/GitHub/Email
- [ ] **Configure CORS** for localhost:3001
- [ ] **Test creating content**
- [ ] **Invite team members** if needed

---

**Ready to Go!**

Restart your dev server and navigate to http://localhost:3001/studio to access the CMS!
