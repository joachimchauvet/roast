# Deploying The Roaster to Vercel

## Prerequisites
- A GitHub/GitLab repository with your code
- A Vercel account (free tier works fine)
- Convex deployment already set up and running

## Step-by-Step Deployment

### 1. Deploy Convex to Production
```bash
# Deploy your Convex backend to production
pnpm convex deploy --prod

# This will give you a production URL like: https://happy-animal-123.convex.cloud
```

### 2. Set up Vercel Project
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect it as a Vite project

### 3. Configure Environment Variables in Vercel
In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variable:
   - **Name**: `VITE_CONVEX_URL`
   - **Value**: Your production Convex URL (from step 1)
   - **Environment**: Production (and Preview if you want)

### 4. Configure Convex Environment Variables
In your Convex dashboard (not Vercel):

1. Go to your **production deployment**
2. Navigate to **Settings** → **Environment Variables**
3. Add your API keys:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `REPLICATE_API_KEY`: (Optional) For image generation

### 5. Deploy
1. Click **Deploy** in Vercel
2. Vercel will automatically:
   - Install dependencies with `pnpm install`
   - Build with `pnpm build`
   - Deploy to a global CDN

## Files Created for Deployment

### `vercel.json`
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
This ensures React Router works properly with client-side routing.

## Deployment Architecture

```
[Vercel Frontend] → [Convex Backend] → [OpenAI API]
     ↓                    ↓
[Global CDN]         [File Storage]
```

## Environment Variables Summary

### Vercel (Frontend)
- `VITE_CONVEX_URL` - Your production Convex URL

### Convex (Backend) 
- `OPENAI_API_KEY` - For AI text generation
- `REPLICATE_API_KEY` - (Optional) For image generation

## Domain Setup (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

## Continuous Deployment

Once set up, every push to your main branch will:
1. Trigger automatic deployment on Vercel
2. Build and deploy your frontend
3. Your Convex backend remains running independently

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure TypeScript compiles locally: `pnpm build`
- For Tailwind v4: Make sure `tailwindcss` is in dependencies (not just devDependencies)

### TypeScript Errors
- Unused imports cause build failures in production
- Use type-only imports: `import { type SomeType } from "module"`
- Remove unused imports before deploying

### App Loads but API Calls Fail
- Verify `VITE_CONVEX_URL` is set in Vercel
- Check Convex environment variables are set
- Ensure Convex production deployment is running

### Images Don't Load
- Check `OPENAI_API_KEY` is set in Convex dashboard
- Verify API key has access to DALL-E 3
- Check Convex function logs for errors

## Performance Notes

- Vercel provides automatic CDN caching
- Images are served from Convex's fast file storage
- First load might be slower due to Convex cold starts
- Subsequent requests are very fast

## Cost Considerations

- **Vercel**: Free tier includes generous limits
- **Convex**: Free tier includes database, functions, and file storage
- **OpenAI**: Pay per API call (image generation is more expensive)

Your app should be live at: `https://your-project-name.vercel.app`