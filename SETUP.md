# Setup Instructions for The Roaster

## Prerequisites
- Node.js 18+
- pnpm package manager
- A Convex account
- An AI API key (either OpenAI or Anthropic)

## Step 1: Install Dependencies
```bash
pnpm install
```

## Step 2: Set up Convex

1. If you haven't already, create a Convex account at https://convex.dev

2. Run the Convex development server:
```bash
pnpm convex dev
```

3. When prompted:
   - Choose to create a new project or use an existing one
   - The tool will automatically update your `.env.local` file with the `VITE_CONVEX_URL`

## Step 3: Configure API Keys

You need to set environment variables in the Convex dashboard (not in local files):

1. Go to your Convex dashboard: https://dashboard.convex.dev
2. Select your project
3. Go to Settings → Environment Variables
4. Add your OpenAI API key:
   - `OPENAI_API_KEY`: Your OpenAI API key (for GPT-4 and DALL-E 3)
   
Optional for alternative image generation:
   - `REPLICATE_API_KEY`: For image generation with Replicate (if you don't have DALL-E 3 access)

## Step 4: Run the Development Server

In a new terminal (keep Convex dev running):
```bash
pnpm dev
```

The app will be available at http://localhost:5173

## How It Works

1. Users enter their information (name, birthdate, hobbies, nationality)
2. The app calculates their zodiac sign from the birthdate
3. A roast is generated using OpenAI GPT-4
4. An optional caricature image is generated with DALL-E 3
5. The roast is saved to the database and displayed
6. All roasts appear in the public leaderboard

## Troubleshooting

### "No AI API key configured" error
- Make sure you've added `OPENAI_API_KEY` in the Convex dashboard
- Restart the Convex dev server after adding environment variables

### Convex connection issues
- Check that `VITE_CONVEX_URL` is set in `.env.local`
- Make sure `pnpm convex dev` is running in a separate terminal

### Image generation not working
- Image generation is optional
- For DALL-E 3: Ensure your OpenAI API key has access to DALL-E
- For Replicate: Add `REPLICATE_API_KEY` in Convex dashboard

## Production Deployment

1. Deploy to Convex production:
```bash
pnpm convex deploy
```

2. Build the frontend:
```bash
pnpm build
```

3. Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)

4. Update environment variables in your hosting service to use the production Convex URL