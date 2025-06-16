# 📦 Wallnance Tycoon – Version 1.2.0

**Release Date:** 2025-06-16

### ✨ Highlights
- New dynamic **Dashboard/Overview page** (Binance-style)
- Performance **badges** and **P&L tracking** (daily + 30 days)
- Asset **pie chart** for portfolio breakdown
- Animated **Buy/Sell modals** for smoother UX
- Improved **mobile responsiveness** (modals, cards, buttons)
- Reworked **WLC whitepaper** with swipable modal slides
- Full **market snapshot** now powered by real-time API
- Cleaned up **README.md** to reflect game-style UI and vibe

### 🐛 Fixes
- Fixed decimal overflow (`3156.800000000001` ➝ `3156.80`)
- Fixed market card alignment issues
- Addressed modal and button scaling on iPhone and smaller devices

---

🛠️ Next version will focus on:
- Trading pair logic
- AI bots or player competition
- Leaderboard, rewards, and advanced tokenomics

## [1.3.0] - 2025-06-16
### Changed
- Refactored entire project structure under `src/`
- Added alias paths for cleaner imports
- Grouped components, hooks, and assets by domain

# 📦 Wallnance Tycoon Changelog

## [1.4.0] - 2025-06-16

### 🚀 Added
- "Symbol" column with proper ticker formatting (e.g., `$BRC`, `$NYC`)
- New tab for "Stocks" to separate company shares
- Token filtering by category: Meme, Stable, Utility, Meta, Layer1

### 🎨 Improved
- Fully redesigned Dashboard UI/UX layout
- Competitor Market UI restructured and aligned
- Trading pair layout with responsive flex-based columns

### 🐛 Fixed
- Ticker display bug where `$` showed without symbols
- Firefox rendering issue with JSX rehydration
- Data not aligning under headers properly

### 🧹 Cleaned
- Removed legacy ID fallback logic from CoinCard
- Tidied up redundant ticker fallbacks and conditionals