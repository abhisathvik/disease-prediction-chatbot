# Setup Instructions for MedBot AI

## 🚀 Quick Start Guide

### 1. Get Your Gemini AI API Key (Free)

To enable the AI chatbot functionality, you need to get a free Gemini AI API key:

1. **Visit Google AI Studio**: Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. **Sign in** with your Google account
3. **Create API Key**: Click "Create API Key" button
4. **Copy the key**: Copy the generated API key (starts with `AIza...`)

### 2. Configure Your Environment

1. **Open the `.env.local` file** in your project root
2. **Replace the placeholder** with your actual API key:
   ```env
   GEMINI_API_KEY=AIzaSy... # Replace with your actual key
   ```
3. **Save the file**

### 3. Generate Secure Secrets

For security, also update these values in `.env.local`:

```env
NEXTAUTH_SECRET=your_very_long_secure_random_string_here_32_chars_min
JWT_SECRET=another_long_secure_random_string_for_jwt_tokens_here
```

You can generate secure secrets using:
```bash
# On macOS/Linux
openssl rand -base64 32

# Or use any password generator for 32+ character strings
```

### 4. Start the Application

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## ✅ Feature Status Without API Key

Even without configuring the Gemini API key, you can still use:

- ✅ **User Registration & Login** - Full authentication system
- ✅ **Disease Prediction** - AI-powered symptom analysis (works offline)
- ✅ **Medical History** - Secure storage of health records
- ✅ **Doctor Locator** - Find nearby healthcare providers
- ❌ **AI Chatbot** - Requires Gemini API key for real-time conversations

## 🔧 Troubleshooting

### Hydration Mismatch Error Fixed
The hydration mismatch errors have been resolved by:
- Adding proper client-side checks for date/time rendering
- Implementing `suppressHydrationWarning` where needed
- Using proper state management for client-only features

### API Key Issues
If you see "AI chatbot is currently not configured":
1. Verify your API key is correctly set in `.env.local`
2. Restart the development server (`npm run dev`)
3. Check the key doesn't have extra spaces or quotes

### Database Issues
If you encounter database errors:
```bash
npx prisma migrate reset
npx tsx scripts/seed.ts
```

## 🚀 Deployment

For zero-cost deployment on Vercel:

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Add Environment Variables** in Vercel dashboard:
   - `GEMINI_API_KEY`
   - `NEXTAUTH_SECRET`
   - `JWT_SECRET`
   - `NEXTAUTH_URL` (your Vercel app URL)

## 🔒 Security Notes

- Never commit real API keys to version control
- Use different secrets for development and production
- The current `.env.local` file is ignored by git for security

## 📞 Support

If you encounter any issues:
1. Check this guide first
2. Verify all environment variables are set correctly
3. Restart the development server
4. Check the browser console for specific errors

---

**Note**: The Gemini API is free with generous usage limits, perfect for personal projects and testing!