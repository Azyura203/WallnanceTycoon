# 📱 Running Wallnance Tycoon on Your Phone

## Quick Start (Recommended)

### Option 1: Using Expo Go App (Easiest)

1. **Install Expo Go on your phone:**
   - iOS: Download from App Store
   - Android: Download from Google Play Store

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Connect your phone:**
   - **iOS**: Open Camera app and scan the QR code shown in terminal
   - **Android**: Open Expo Go app and scan the QR code

4. **Play the game!** 🎮

### Option 2: Using Development Build (Better Performance)

If you want better performance and native features:

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Build for your device:**
   ```bash
   # For iOS (requires Apple Developer account)
   eas build --platform ios --profile development

   # For Android
   eas build --platform android --profile development
   ```

4. **Install the build on your phone**

## Troubleshooting

### Common Issues:

1. **QR Code not working:**
   - Make sure your phone and computer are on the same WiFi network
   - Try running: `npm run dev -- --tunnel`

2. **App crashes on phone:**
   - Check the terminal for error messages
   - Try clearing cache: `npm run dev:clean`

3. **Fonts not loading:**
   - Wait a few seconds for fonts to download
   - Restart the app if needed

### Performance Tips:

- Close other apps while playing for better performance
- Use a development build for smoother gameplay
- Make sure you have a stable internet connection for market data

## Game Features on Mobile:

✅ **Touch Controls**: Tap to buy/sell coins
✅ **Responsive Design**: Optimized for mobile screens  
✅ **Real-time Data**: Live market prices via API
✅ **Offline Portfolio**: Your progress saves locally
✅ **Push Notifications**: Market alerts (in development builds)

## Next Steps:

Once you have the game running, you can:
- Start with $1,000,000 virtual money
- Buy and sell crypto tokens
- Build your portfolio
- Track your performance
- Compete with AI traders

Enjoy building your crypto empire! 🚀💰