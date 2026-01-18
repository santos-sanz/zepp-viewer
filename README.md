# Zepp Health Viewer 🏃‍♂️💤

A modern, intuitive dashboard to visualize your health data exported from the Zepp app. Built with Next.js 15, TypeScript, and TailwindCSS.

![Dashboard Preview](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-cyan?style=flat-square&logo=tailwindcss)

## ✨ Features

- **📊 Activity Tracking** - View steps, distance, and calories trends over time
- **😴 Sleep Analysis** - Visualize sleep stages (Deep, Light, REM) with beautiful stacked charts
- **⚖️ Body Composition** - Track weight and BMI changes
- **🏋️ Workout Stats** - See your sport/workout history
- **🤖 AI Health Assistant** - Chat with an AI powered by OpenRouter to get insights about your health data

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Zepp data export (CSV files)

### Installation

```bash
# Clone the repository
git clone https://github.com/santos-sanz/zepp-viewer.git
cd zepp-viewer

# Install dependencies
npm install

# Set up your environment variables
cp .env.example .env
# Edit .env with your OpenRouter API key

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Data Setup

1. Export your data from the Zepp app (Settings → Account → Export Data)
2. Extract the ZIP file contents to the `personal_data/` folder
3. Restart the development server

## 🔧 Environment Variables

Create a `.env` file with:

```env
OPENROUTER_API_KEY=your_api_key_here
MODEL_ID=xiaomi/mimo-v2-flash:free
```

Get your OpenRouter API key at [openrouter.ai](https://openrouter.ai)

## 📁 Project Structure

```
zepp-viewer/
├── personal_data/          # Your exported Zepp data (gitignored)
│   ├── ACTIVITY/          
│   ├── SLEEP/             
│   ├── HEARTRATE_AUTO/    
│   ├── SPORT/             
│   ├── BODY/              
│   └── USER/              
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── api/          # API routes (chat, data)
│   │   └── page.tsx      # Main dashboard
│   ├── components/        # React components
│   │   ├── charts/       # Recharts visualizations
│   │   ├── ui/           # Reusable UI components
│   │   ├── Dashboard.tsx # Main dashboard component
│   │   └── AIChatPanel.tsx
│   ├── lib/              # Utilities
│   │   └── data-loader.ts # CSV parsing functions
│   └── types/            # TypeScript types
└── .agent/skills/         # Vercel agent skills
```

## 🛠️ Built With

- [Next.js 15](https://nextjs.org/) - React framework with Turbopack
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [TailwindCSS 4](https://tailwindcss.com/) - Styling
- [Recharts](https://recharts.org/) - Chart visualizations
- [OpenRouter](https://openrouter.ai/) - AI chat integration
- [Vercel Agent Skills](https://github.com/vercel-labs/agent-skills) - React best practices

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Zepp (formerly Amazfit) for the health tracking app
- OpenRouter for AI model access
- Vercel for the excellent React framework

---

Made with ❤️ for health enthusiasts
