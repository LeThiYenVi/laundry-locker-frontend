# Firebase Configuration Summary - Laundry Locker

## ✅ Configuration Status: COMPLETED

### 📱 Google Services JSON
- **Location**: `android/app/google-services.json`
- **Project ID**: `laundry-locker-19a9d`
- **Package Name**: `com.laundrylocker.mobile`
- **Status**: ✅ Updated and properly configured

### 🔑 SHA Fingerprints Configured

#### Debug Build
- **SHA-1**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- **Status**: ✅ Already added to Firebase (in google-services.json)

#### Release Build  
- **SHA-1**: `EF:32:59:FA:F0:EC:97:B3:0C:7E:39:B5:1E:2F:BA:F9:F0:DC:EA:D7`
- **Keystore**: `android/app/laundry-locker-release.keystore`
- **Status**: ⚠️ **ACTION REQUIRED** - Needs to be added to Firebase Console

---

## 🛠️ Changes Applied

### 1. Google Services Configuration ✅
- Copied new `google-services.json` to `android/app/` directory
- Google Services plugin verified in `build.gradle`:
  ```gradle
  classpath 'com.google.gms:google-services:4.4.1'
  apply plugin: 'com.google.gms.google-services'
  ```

### 2. Release Signing Configuration ✅
Updated `android/app/build.gradle` with release keystore:

```gradle
signingConfigs {
    release {
        storeFile file('laundry-locker-release.keystore')
        storePassword 'LaundryLocker@2026'
        keyAlias 'laundry-locker-key'
        keyPassword 'LaundryLocker@2026'
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        // ... other config
    }
}
```

---

## 🚨 NEXT STEPS REQUIRED

### 1. Add Release SHA to Firebase Console

**IMPORTANT**: For Google Sign-In to work in release builds, you **MUST** add the release SHA-1 to Firebase:

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select project: **laundry-locker-19a9d**
3. Go to **Project Settings** ⚙️
4. Scroll down to **Your apps** section
5. Click on your Android app: `com.laundrylocker.mobile`
6. Click **"Add fingerprint"**
7. Paste the **Release SHA-1**:
   ```
   EF:32:59:FA:F0:EC:97:B3:0C:7E:39:B5:1E:2F:BA:F9:F0:DC:EA:D7
   ```
8. Click **Save**

### 2. Download Updated google-services.json

After adding the SHA fingerprint:
1. Download the new `google-services.json` from Firebase
2. Replace `android/app/google-services.json` with the new file
3. Verify both debug and release SHA certificates are listed

### 3. Build and Test

#### Debug Build (will use debug SHA)
```bash
cd android
./gradlew assembleDebug
```

#### Release Build (will use release SHA)
```bash
cd android
./gradlew assembleRelease
```

The release APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 📂 File Structure

```
mobile/
├── android/
│   ├── app/
│   │   ├── google-services.json          ✅ Firebase config (active)
│   │   ├── debug.keystore                ✅ Debug signing
│   │   ├── laundry-locker-release.keystore ✅ Release signing
│   │   └── build.gradle                  ✅ Configured
│   └── build.gradle                      ✅ Google Services plugin
├── google-services.json                  ℹ️ Backup copy (not used)
├── sha.txt                               ℹ️ Debug SHA info
└── release-sha.txt                       ℹ️ Release SHA info
```

---

## 🔐 Security Notes

### Files to KEEP SECRET:
- ❌ **DO NOT** commit `laundry-locker-release.keystore` to Git
- ❌ **DO NOT** share keystore password publicly
- ✅ Add to `.gitignore`:
  ```gitignore
  # Release keystore
  android/app/laundry-locker-release.keystore
  ```

### Backup Recommendations:
- 📦 Store keystore in secure location (password manager, encrypted backup)
- 📝 Save keystore password securely
- ⚠️ **IF YOU LOSE THE KEYSTORE, YOU CANNOT UPDATE YOUR APP ON PLAY STORE**

---

## ✅ What's Working Now

- ✅ Firebase connected to Android app
- ✅ Google Services plugin configured
- ✅ Debug builds will use debug SHA (already in Firebase)
- ✅ Release builds will use release keystore
- ⏳ Release SHA needs to be added to Firebase for Google Sign-In

---

## 📚 Reference Files

- Debug SHA details: `sha.txt`
- Release SHA details: `release-sha.txt`
- Current Firebase config: `android/app/google-services.json`
