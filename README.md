# MedBot AI - Disease Prediction Chatbot

A comprehensive AI-powered disease prediction and medical chatbot application built with Next.js, featuring real-time symptom analysis, intelligent health consultations, and secure medical history management.

## 🎯 Current Status

### ✅ **Fully Working Features:**
- **User Authentication** - Complete signup/login system with secure sessions
- **Disease Prediction** - AI-powered analysis of 3 symptoms with confidence scores  
- **Dashboard** - Beautiful main interface with health monitoring
- **Medical History** - Secure storage and viewing of prediction history
- **Doctor Locator** - Find nearby healthcare providers (demo data)
- **Responsive Design** - Works perfectly on all devices
- **Database Integration** - SQLite with comprehensive health data

### ⚠️ **Chatbot Status:**
The AI chatbot requires a valid Gemini API key to function. Without it, you'll see a helpful message explaining how to configure it. All other features work independently.

### 🔧 **Hydration Issues Fixed:**
All React hydration mismatch errors have been resolved through:
- Proper client-side rendering checks
- Secure localStorage access
- Appropriate suppressHydrationWarning usage

---
- **AI Disease Prediction**: Advanced symptom analysis that takes 3 symptoms and provides top 3 predicted diseases with confidence scores
- **Smart Medical Chatbot**: Real-time health consultations powered by Google's Gemini AI
- **Secure Authentication**: Complete user registration and login system with JWT tokens
- **Medical History Management**: Secure storage and retrieval of user health records
- **Disease Information**: Detailed information about diseases including causes, precautions, medicines, and severity levels
- **Doctor Locator**: Find nearby healthcare providers (demo implementation)

### Technical Features
- **Real-time Chat Interface**: Dynamic, responsive chatbot with typing indicators
- **Responsive Design**: Mobile-first design that works on all devices
- **Secure Data Storage**: Encrypted medical data with privacy protection
- **Zero-cost Deployment**: Optimized for free deployment on Vercel
- **TypeScript**: Full type safety throughout the application
- **Modern UI/UX**: Beautiful animations with Framer Motion

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google AI API key (free from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd disease-prediction
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   NEXTAUTH_SECRET=your_secure_secret_key_here
   DATABASE_URL="file:./dev.db"
   JWT_SECRET=your_jwt_secret_here
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev --name init
   npx tsx scripts/seed.ts
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production)
- **AI Integration**: Google Gemini AI
- **Authentication**: JWT tokens, bcrypt
- **UI Components**: Headless UI, Lucide React icons
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast

### Database Schema
- **Users**: Authentication and profile data
- **Medical History**: User health records and symptoms
- **Disease Queries**: Prediction results and analysis
- **Chat Sessions**: Conversation history with AI
- **Diseases**: Comprehensive disease database

## 📱 Pages & Features

### Authentication
- **Landing Page** (`/`): Welcome page with feature overview
- **Register** (`/register`): User signup with form validation
- **Login** (`/login`): Secure user authentication

### Main Application
- **Dashboard** (`/dashboard`): Central hub with quick actions
- **Chat** (`/chat`): Real-time AI medical consultations
- **Predict** (`/predict`): Symptom analysis and disease prediction
- **History** (`/history`): Medical records and prediction history
- **Doctors** (`/doctors`): Healthcare provider locator

## 🔒 Security Features

- **Data Encryption**: All sensitive data is encrypted
- **Secure Authentication**: JWT tokens with secure session management
- **Privacy Protection**: Medical data is stored securely and privately
- **Input Validation**: Comprehensive validation on all user inputs
- **Medical Disclaimers**: Clear disclaimers about AI limitations

## 🚀 Deployment

### Zero-Cost Deployment on Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy automatically

3. **Environment Variables for Production**
   ```env
   GEMINI_API_KEY=your_api_key
   NEXTAUTH_SECRET=your_production_secret
   NEXTAUTH_URL=https://your-app.vercel.app
   DATABASE_URL=your_production_database_url
   JWT_SECRET=your_production_jwt_secret
   ```

### Database Options for Production
- **Vercel Postgres**: Free tier available
- **PlanetScale**: Generous free tier
- **Supabase**: Free PostgreSQL hosting
- **Turso**: SQLite-compatible edge database

## 🎯 Getting Your API Keys

### Gemini AI API Key (Required)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your environment variables

### Google Maps API Key (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable the Maps JavaScript API
3. Create credentials for your application
4. Add the key to enhance doctor location features

## 🔧 Configuration

### Customizing the Disease Database
Edit `scripts/seed.ts` to add more diseases to the prediction system:

```typescript
const diseaseData = [
  {
    name: "Your Disease",
    description: "Disease description",
    symptoms: JSON.stringify(["symptom1", "symptom2"]),
    causes: JSON.stringify(["cause1", "cause2"]),
    precautions: JSON.stringify(["precaution1", "precaution2"]),
    medicines: JSON.stringify(["medicine1", "medicine2"]),
    severity: "medium", // low, medium, high, critical
    category: "Category"
  }
]
```

### Customizing AI Responses
Modify the system prompts in `src/lib/geminiChatbot.ts` to adjust the AI's personality and medical guidance style.

## 📊 Features in Detail

### Disease Prediction Algorithm
- **Symptom Matching**: Advanced string matching with Levenshtein distance
- **Confidence Scoring**: Weighted scoring based on symptom overlap and disease severity
- **Top 3 Results**: Always returns the most likely conditions
- **Match Highlighting**: Shows which symptoms contributed to each prediction

### AI Chatbot Capabilities
- **Medical Context Awareness**: Uses user's medical history for personalized responses
- **Real-time Responses**: Streaming responses for better user experience
- **Medical Disclaimers**: Automatic inclusion of appropriate medical warnings
- **Conversation Memory**: Maintains context across conversation sessions

## ⚠️ Important Medical Disclaimer

This application is designed for educational and informational purposes only. It should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified healthcare professionals with any questions you may have regarding a medical condition.

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- **Live Demo**: [Your deployed application URL]
- **API Documentation**: Available in the `/api` routes
- **Bug Reports**: [GitHub Issues](your-repo-url/issues)

## 📞 Support

For support, email [your-email] or open an issue on GitHub.

---

Built with ❤️ for better healthcare accessibility