# Zepp Health Analytics 🏃‍♂️💤📊

A comprehensive health analytics dashboard for visualizing Zepp app exports. Built with Next.js 15, featuring expert-level statistics, trend analysis, and AI-powered insights.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-cyan?style=flat-square&logo=tailwindcss)

## ✨ Features

### 📈 Expert Analytics
- **Percentile Distribution** - P25, P50, P75, P90, P95 for benchmarking
- **Trend Analysis** - 7-day and 30-day trends with percentage changes
- **Consistency Scores** - Coefficient of variation analysis
- **Weekly Patterns** - Day-of-week performance analysis
- **Monthly Progression** - Long-term tracking over 12 months

### 🏃 Activity Tracking
- Steps, distance, and calories with daily averages
- Best/worst day records and streak tracking
- Distribution analysis (days >10k, >5k, <2k steps)

### 😴 Sleep Analysis
- **Sleep Architecture** - Deep, Light, REM sleep percentages with pie chart
- **Sleep Efficiency** - Time asleep vs time in bed
- **Sleep Debt** - Comparison against recommended hours
- **Bedtime/Wake Patterns** - Average sleep schedule

### ⚖️ Body Composition
- Weight journey with start/current comparison
- BMI classification with visual gauge
- Body fat, muscle rate, metabolism (if available)
- Rate of change (kg/week)

### 🤖 AI Health Assistant
- Chat with AI about your health data
- Powered by OpenRouter
- Context-aware insights from your data

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Zepp data export (CSV files)
- OpenRouter API key

### Installation

```bash
# Clone the repository
git clone https://github.com/santos-sanz/zepp-viewer.git
cd zepp-viewer

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your OpenRouter API key

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Data Setup

1. Export data from Zepp app (Settings → Account → Export Data)
2. Extract ZIP contents to `personal_data/` folder
3. Restart the development server

## 📁 Project Structure

```
zepp-viewer/
├── personal_data/          # Your exported Zepp data (gitignored)
│   ├── ACTIVITY/           # Steps, distance, calories
│   ├── SLEEP/              # Sleep stages, duration
│   ├── HEARTRATE_AUTO/     # Heart rate readings
│   ├── SPORT/              # Workout sessions
│   ├── BODY/               # Weight, BMI, body composition
│   └── USER/               # Profile information
├── src/
│   ├── app/
│   │   ├── api/            # API routes (chat, data)
│   │   └── page.tsx        # Main dashboard
│   ├── components/
│   │   ├── charts/         # Recharts visualizations
│   │   ├── details/        # Expert analytics panels
│   │   ├── ui/             # Reusable UI components
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   └── AIChatPanel.tsx # AI chat interface
│   ├── lib/
│   │   ├── analytics.ts    # Statistical calculations
│   │   └── data-loader.ts  # CSV parsing
│   └── types/              # TypeScript definitions
```

## 🔧 Environment Variables

```env
OPENROUTER_API_KEY=your_api_key_here
MODEL_ID=xiaomi/mimo-v2-flash:free
```

## 📊 Analytics Explained

| Metric | Description |
|--------|-------------|
| **Percentiles** | P50 = median, P75 = top quartile, P90/95 = exceptional days |
| **Consistency** | 100% = identical daily values, lower = more variability |
| **Sleep Efficiency** | (Total sleep / Time in bed) × 100 |
| **Sleep Architecture** | Healthy: 15-20% Deep, 20-25% REM, 50-60% Light |
| **BMI Categories** | <18.5 Underweight, 18.5-25 Normal, 25-30 Overweight, 30+ Obese |

## 🛠️ Built With

- [Next.js 15](https://nextjs.org/) - React framework with Turbopack
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [TailwindCSS 4](https://tailwindcss.com/) - Styling
- [Recharts](https://recharts.org/) - Chart visualizations
- [OpenRouter](https://openrouter.ai/) - AI chat integration

## 📝 License

MIT License - see [LICENSE](LICENSE)

---

Built with ❤️ for health-conscious data enthusiasts
