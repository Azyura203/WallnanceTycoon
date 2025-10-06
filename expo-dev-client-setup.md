# 🔧 Advanced Mobile Setup with Expo Dev Client

For the best mobile experience with Wallnance Tycoon, use Expo Dev Client:

## Why Use Dev Client?

- **Better Performance**: Native performance vs web-based Expo Go
- **Full Feature Access**: All React Native libraries work
- **Custom Native Code**: Can add native modules if needed
- **Faster Debugging**: Better error reporting and debugging tools

## Setup Steps:

### 1. Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### 2. Configure EAS Build
```bash
eas build:configure
```

### 3. Create Development Build
```bash
# For Android (free)
eas build --platform android --profile development

# For iOS (requires Apple Developer Program - $99/year)
eas build --platform ios --profile development
```

### 4. Install on Device
- **Android**: Download APK from build link and install
- **iOS**: Install via TestFlight or direct installation

### 5. Start Development Server
```bash
npm run dev
```

### 6. Connect to Dev Client
- Open your custom dev client app
- Scan QR code or enter development server URL

## Benefits for Wallnance Tycoon:

- **Smoother Animations**: Better chart rendering and coin flip animations
- **Faster Market Updates**: Real-time price updates without lag
- **Better Storage**: More reliable AsyncStorage for game saves
- **Native Feel**: App feels like a real native trading app

## Alternative: Expo Go (Quick Start)

If you just want to try the game quickly:

1. Install Expo Go from your app store
2. Run `npm run dev` 
3. Scan QR code with Expo Go
4. Start trading! 📈

The game works great in both setups, but Dev Client provides the premium experience! 🎮