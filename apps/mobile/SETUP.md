# Capacitor Setup Guide for Megapayer Mobile App

## Prerequisites

1. **Node.js** (v18+) and npm
2. **Android Studio** with:
   - Android SDK (API 33+)
   - Platform Tools
   - Android Emulator or physical device
3. **Java 17** (required by Gradle)
4. **Capacitor CLI** (installed globally or via npx)

## Installation Steps

### 1. Install Dependencies

```bash
cd apps/mobile
npm install
```

This will install:
- Capacitor core and Android platform
- Biometric authentication plugin
- QR/Barcode scanner plugin
- Secure storage plugin

### 2. Initialize Capacitor

```bash
npm run cap:add:android
```

This creates the `android/` directory with native Android project.

### 3. Build Web Bundle

```bash
npm run build
```

This runs `next build && next export -o out`, creating the static export in `out/` directory.

### 4. Sync with Native Project

```bash
npm run cap:sync
```

This copies the web bundle to the native Android project.

### 5. Open in Android Studio

```bash
npm run cap:open:android
```

Or manually:
```bash
npx cap open android
```

## Android Configuration

### Permissions (Already configured in `AndroidManifest.xml`)

The following permissions are required:

- `CAMERA` - For QR code scanning
- `USE_BIOMETRIC` / `USE_FINGERPRINT` - For biometric authentication

### Build Configuration

The app is configured with:
- **App ID**: `com.megapayer.wallet`
- **App Name**: `Megapayer`
- **Target SDK**: 33+
- **Min SDK**: 22+

## Building Signed APK

### Option 1: Using Android Studio

1. Open project in Android Studio
2. Go to **Build → Generate Signed Bundle / APK**
3. Select **APK**
4. Choose or create a keystore:
   - If you have a keystore, browse and enter password
   - If creating new:
     - Alias: `megapayer`
     - Password: (your choice)
     - Validity: 25+ years
     - Certificate info: Fill as needed
5. Select **release** build variant
6. Click **Finish**
7. APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

### Option 2: Using Gradle CLI

1. Create/use keystore (if not exists):
```bash
cd android/app
keytool -genkey -v -keystore megapayer-release.keystore -alias megapayer -keyalg RSA -keysize 2048 -validity 10000
```

2. Update `android/app/build.gradle` signing config:
```gradle
signingConfigs {
    release {
        storeFile file('megapayer-release.keystore')
        storePassword 'YOUR_STORE_PASSWORD'
        keyAlias 'megapayer'
        keyPassword 'YOUR_KEY_PASSWORD'
    }
}
```

3. Build release APK:
```bash
cd android
./gradlew assembleRelease
```

4. APK location: `android/app/build/outputs/apk/release/app-release.apk`

## Development Workflow

1. Make changes to React/Next.js code
2. Build: `npm run build`
3. Sync: `npm run cap:sync`
4. Run on device/emulator from Android Studio

**OR** use the combined command:
```bash
npm run android:build
```

## Testing Checklist

- [ ] App installs and launches
- [ ] Biometric prompt appears on unlock screen
- [ ] Biometric unlock works (fingerprint/FaceID)
- [ ] QR scanner opens and reads addresses
- [ ] QR scanner fills Send form correctly
- [ ] All routes work correctly
- [ ] No console errors
- [ ] Permissions requested correctly
- [ ] App name and icon display correctly

## Troubleshooting

### Build Errors

- Ensure Java 17 is installed and `JAVA_HOME` is set
- Clear build cache: `cd android && ./gradlew clean`

### Permission Issues

- Check `AndroidManifest.xml` has all required permissions
- Ensure runtime permissions are requested (handled by plugins)

### Capacitor Sync Issues

- Ensure `out/` directory exists after build
- Check `capacitor.config.ts` has correct `webDir: 'out'`

### Plugin Issues

- Run `npm run cap:sync` after installing new plugins
- Ensure plugins are registered in `capacitor.config.ts`

## Notes

- The app exports to `out/` directory (static export)
- QR scanner requires camera permission (requested automatically)
- Biometric requires device support and user enrollment
- Secure storage uses Android KeyStore for encryption

