# 🚀 Megapayer Android APK Build Instructions

## ✅ Setup Complete!

All dependencies have been installed and Capacitor has been configured. The app is ready to build!

## 📋 What's Been Done

✅ **Dependencies Installed**
- Capacitor 6.0.1 and Android platform
- Biometric authentication plugin
- QR/Barcode scanner plugin  
- Secure storage plugin
- All required Capacitor plugins

✅ **Capacitor Configured**
- App ID: `com.megapayer.wallet`
- Web directory: `out/`
- Android platform added

✅ **Build Complete**
- Next.js app built successfully
- Static export created in `out/` directory
- Capacitor synced with Android project

✅ **Android Permissions Added**
- Camera permission (QR scanner)
- Biometric permissions (Fingerprint/FaceID)
- Internet permission

✅ **Features Integrated**
- Biometric unlock on `/unlock` page
- QR scanner in Send form
- Secure storage for encrypted data

## 🏗️ Build Signed APK

### Option 1: Using Android Studio (Recommended)

1. **Open Project in Android Studio**
   ```bash
   cd apps/mobile
   npx cap open android
   ```
   Or manually open `apps/mobile/android` folder in Android Studio

2. **Wait for Gradle Sync** (Android Studio will download dependencies)

3. **Create Keystore** (if you don't have one)
   - In Android Studio: Build → Generate Signed Bundle / APK
   - Choose **APK**
   - Click **Create new...** to create keystore
   - Fill in:
     - **Key store path**: `keystore/megapayer-release.keystore`
     - **Password**: (your choice - keep it secure!)
     - **Key alias**: `megapayer`
     - **Key password**: (can be same as store password)
     - **Validity**: 25+ years
     - **First and last name**: Megapayer
     - **Organizational unit**: Development
     - **Organization**: Megapayer
     - **City**: (your city)
     - **State**: (your state)
     - **Country code**: US

4. **Build Release APK**
   - Build → Generate Signed Bundle / APK
   - Select **APK**
   - Choose your keystore
   - Select **release** build variant
   - Click **Finish**

5. **APK Location**
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

### Option 2: Using Gradle CLI

1. **Navigate to Android directory**
   ```bash
   cd apps/mobile/android
   ```

2. **Create Keystore** (if needed)
   ```bash
   keytool -genkey -v -keystore ../keystore/megapayer-release.keystore -alias megapayer -keyalg RSA -keysize 2048 -validity 10000
   ```

3. **Configure signing** (if not done in Android Studio)
   - Edit `android/app/build.gradle`
   - Add signing configs section before `buildTypes`:
   ```gradle
   signingConfigs {
       release {
           storeFile file('../keystore/megapayer-release.keystore')
           storePassword 'YOUR_STORE_PASSWORD'
           keyAlias 'megapayer'
           keyPassword 'YOUR_KEY_PASSWORD'
       }
   }
   buildTypes {
       release {
           signingConfig signingConfigs.release
           minifyEnabled false
           proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
       }
   }
   ```

4. **Build APK**
   ```bash
   ./gradlew assembleRelease
   ```
   (Windows: `.\gradlew.bat assembleRelease`)

5. **APK Location**
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

## 🧪 Testing

### Before Building APK

1. **Test on Device/Emulator**
   ```bash
   cd apps/mobile
   npm run android:build
   ```
   This will:
   - Build the web bundle
   - Sync with Capacitor
   - Open Android Studio
   - Run on connected device/emulator

2. **Test Features**
   - ✅ App installs and launches
   - ✅ Biometric prompt appears (if device supports)
   - ✅ QR scanner opens and scans addresses
   - ✅ All pages load correctly
   - ✅ Wallet unlock works

### After Building APK

1. **Install APK on Device**
   - Enable "Install from Unknown Sources" in Android settings
   - Transfer APK to device
   - Install and test

2. **Test Checklist**
   - [ ] App installs successfully
   - [ ] App launches without crashes
   - [ ] Biometric unlock works (if device supports)
   - [ ] QR scanner requests permission and works
   - [ ] Send form accepts scanned addresses
   - [ ] All navigation works
   - [ ] Wallet creation/import works
   - [ ] Transactions work

## 📱 Development Workflow

After making code changes:

```bash
cd apps/mobile

# 1. Build web bundle
npm run build

# 2. Sync with Capacitor
npm run cap:sync

# 3. Open in Android Studio (or run from Studio)
npm run cap:open:android
```

## 🔧 Configuration Files

- **Capacitor Config**: `capacitor.config.ts`
- **Android Manifest**: `android/app/src/main/AndroidManifest.xml`
- **Build Config**: `android/app/build.gradle`
- **Next.js Config**: `next.config.js`

## 📝 Notes

- **Keystore Security**: Keep your keystore file and passwords secure! You'll need them for updates.
- **Version Updates**: Update `versionCode` and `versionName` in `android/app/build.gradle` for each release
- **Biometric**: Only works on devices with fingerprint/FaceID support
- **QR Scanner**: Requires camera permission (requested automatically)

## 🐛 Troubleshooting

**Build Errors:**
- Ensure Java 17 is installed
- Run `cd android && ./gradlew clean` to clear cache
- Check `JAVA_HOME` environment variable

**Plugin Issues:**
- Run `npm run cap:sync` after any plugin changes
- Check `android/app/src/main/java/.../MainActivity.java` has plugin imports

**Permission Issues:**
- Verify `AndroidManifest.xml` has all required permissions
- Check device settings if permissions aren't being requested

---

**Status**: ✅ Ready to build APK! Follow steps above to generate signed release APK.

