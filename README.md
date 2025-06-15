[wlc_whitepaper.md](https://github.com/user-attachments/files/20747117/wlc_whitepaper.md)
![image](https://github.com/user-attachments/assets/9a7cda6a-1c5a-4377-bdc1-d9951c85d524)


💸 Wallnance Tycoon 📈

Wallnance Tycoon is a real-time crypto trading simulation game built with React Native and Expo. Trade fun fictional tokens, track your portfolio, manage risk, and flex your market instincts in a beautifully designed mobile-first experience. Think Binance meets meme culture… with better UI and less FOMO. 🐸💰📉

⸻

🚀 Core Features
	•	🪙 Real-Time Market – Live token prices with 1-min updates via API
	•	📈 Portfolio Tracking – View performance, net worth, and distribution
	•	📊 Dynamic Charts – Line & pie charts with smooth animations
	•	🧠 Performance Badges – Auto-graded tokens by daily/weekly P&L
	•	💼 WLC Integration – In-game utility token with real whitepaper
	•	👾 AI/Bot Traders – Compete against evolving market bots
	•	🎨 Sleek UI – Modern design, responsive layout, mobile-ready
	•	🧾 Market Overview Dashboard – Gainers, volumes, live stats
	•	🔐 Login / Auto Save – Resume where you left off
	•	🛠️ Modular Codebase – Easy to extend and customize
---

## 🛠 Setup & Installation

```bash
git clone https://github.com/Azyura203/WallnanceTycoon.git
cd WallnanceTycoon
npm install
npx expo start
## ⚙️ Development Tips
- Make sure you’re using the correct React & Expo versions.
- Enable live reload and debug using Expo Go on your mobile device.
```
🔧 Requirements
	•	Node.js & npm
	•	React Native + Expo SDK 53+
	•	Expo Go (iOS/Android)
	•	Internet for market API

💡 Gameplay Highlights
	•	📉 Buy & Sell Memecoins – CrypTofu, SoyETH, BitRice and more
	•	🔄 Simulated Trading – API + logic = realistic price movement
	•	📆 24H / 30D P&L Analysis – Just like real exchanges
	•	🧠 Learn Finance – Risk-free way to understand markets
	•	🪙 WLC Tokenomics – Our own in-game stablecoin (Whitepaper included)

📄 View [wlc_whitepaper.md] 


🖥️ File Structure
/project
│
├── app/              # Screens & pages
├── components/       # UI components (modals, cards, charts)
├── lib/              # Custom logic (hooks, API, helpers)
├── store/            # Zustand global state
├── utils/            # Formatters, calculators
├── assets/           # Icons, fonts, images
├── docs/             # Whitepaper & documentation

⸻

🐞 Known Issues
	•	🚫 NaN values in some trust/interest outputs
	•	🌀 Prices can inflate indefinitely if not balanced (being patched)
	•	🤖 AI traders still in development

⸻

🌐 Web Deployment

You can also build for web using Netlify or Vercel:
npm run build:web

Upload dist/ to your Netlify project
Set Base directory = ./
Build command = npm run build:web
Publish directory = dist

🎯 Roadmap
	•	📱 Trading Pairs Support
	•	👥 Multiplayer / Player Rankings
	•	🧾 Weekly Finance Reports
	•	🎨 Custom Themes (Gothic / Minimal)
	•	🧠 Advanced AI Bot Traders
	•	🎁 Real Perks for WLC Holders

⸻

👷 Contributing

We’d love your help!
	•	💬 Suggest features
	•	🎨 Improve UI
	•	🪙 Add hilarious new coins

⸻

👑 Creator’s Note

Wallnance Tycoon isn’t just a game — it’s a gateway to learning financial literacy in a fun, addictive, and gamified way.

“Start poor. Stay smart. Get rich.”
— Kane, Founder of KANEDEV

 📷 Screenshots

Coming soon — or add yours and help this README shine!

⸻

🧠 Tech Stack
	•	React Native + Expo
	•	Zustand for global state
	•	Custom Hooks for logic
	•	React Navigation
	•	Styled with Tailwind-like utility classes
