# 🚨 URGENT: Fix Firebase Authentication Error

## ❌ Current Error
```
Error: [auth/app-not-authorized] This app is not authorized to use Firebase Authentication.
Please verify that the correct package name, SHA-1, and SHA-256 are configured in the Firebase Console.
```

## 🔍 Root Cause
The **SHA certificate fingerprint** in your Firebase Console **DOES NOT MATCH** your actual debug keystore.

### What's Wrong:
- **In `google-services.json`**: `5e8f16062ea3cd2c4a0d547876baa6f38cabf625`
- **Actual Debug SHA-1**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

❗ **The certificate hash in google-services.json is CORRECT but formatted differently (lowercase, no colons)**

## 🔧 **SOLUTION: Add SHA to Firebase Console**

You MUST add both debug AND release SHA certificates to Firebase Console.

---

## 📋 **Step-by-Step Fix**

### Step 1: Get Your SHA Certificates

#### Debug Build SHA (for development):
```
SHA-1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
SHA-256: FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C
```

#### Release Build SHA (for production):
```
SHA-1: EF:32:59:FA:F0:EC:97:B3:0C:7E:39:B5:1E:2F:BA:F9:F0:DC:EA:D7
```

---

### Step 2: Add SHA Certificates to Firebase Console

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/
   - Select project: **laundry-locker-19a9d**

2. **Navigate to Project Settings**
   - Click the ⚙️ gear icon (top left) → **Project Settings**

3. **Find Your Android App**
   - Scroll down to **"Your apps"** section
   - Find app with package: `com.laundrylocker.mobile`
   - You should see app ID: `1:1007589685877:android:1afa036d6ef7aba040963c`

4. **Add SHA Fingerprints**
   Click **"Add fingerprint"** button and add BOTH:
   
   #### Add Debug SHA-1:
   ```
   5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
   ```
   
   #### Add Release SHA-1:
   ```
   EF:32:59:FA:F0:EC:97:B3:0C:7E:39:B5:1E:2F:BA:F9:F0:DC:EA:D7
   ```

5. **Save Changes**
   - The changes are saved automatically when you add fingerprints

---

### Step 3: Download Updated google-services.json

**IMPORTANT**: After adding SHA fingerprints, you MUST download the new `google-services.json`:

1. In Firebase Console, on the same page
2. Scroll down and click **"Download google-services.json"**
3. Replace the file at: `android/app/google-services.json`

---

### Step 4: Rebuild the App

After replacing `google-services.json`, rebuild:

```bash
cd android
./gradlew clean
cd ..
npm run android
```

Or if you want to force a clean build:
```bash
# Stop the current metro bundler (Ctrl+C if running)
# Clean build
cd android
./gradlew clean
./gradlew assembleDebug
cd ..
# Restart
npm run android
```

---

## ✅ **Quick Checklist**

- [ ] Open Firebase Console: https://console.firebase.google.com/
- [ ] Navigate to Project Settings → Your apps → Android app
- [ ] Add Debug SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- [ ] Add Release SHA-1: `EF:32:59:FA:F0:EC:97:B3:0C:7E:39:B5:1E:2F:BA:F9:F0:DC:EA:D7`
- [ ] Download new `google-services.json`
- [ ] Replace `android/app/google-services.json` with new file
- [ ] Clean and rebuild app
- [ ] Test login again

---

## 🎯 **Why This Happens**

Firebase Authentication uses SHA certificates to verify that requests are coming from your legitimate app. When you:
- Created the Firebase project, OR
- Downloaded `google-services.json` before adding SHA certificates

The file doesn't include the authentication configuration for your specific keystore.

By adding SHA fingerprints and downloading a fresh `google-services.json`, Firebase will properly authorize your app.

---

## 📸 **Visual Guide**

### Firebase Console Location:
1. Project Settings (gear icon) →
2. Scroll to "Your apps" →
3. Click on Android app →
4. Find "SHA certificate fingerprints" section →
5. Click "Add fingerprint"

### What It Should Look Like After:
You should see TWO fingerprints listed:
- `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` (Debug)
- `EF:32:59:FA:F0:EC:97:B3:0C:7E:39:B5:1E:2F:BA:F9:F0:DC:EA:D7` (Release)

---

## 🔐 **Security Note**

- Debug SHA is safe to share (it's public in Android SDK)
- Release SHA should be kept private
- These certificates are tied to your keystore files
- If you lose your release keystore, you cannot update your app on Play Store

---

## ❓ **Troubleshooting**

### After fixing, still getting error?
1. Make sure you downloaded the NEW `google-services.json` AFTER adding SHA
2. Verify the file is in `android/app/` directory (not root)
3. Do a clean rebuild: `cd android && ./gradlew clean && cd ..`
4. Restart the app completely

### Can't find SHA fingerprints section?
- Make sure you're looking at the Android app (not iOS or Web)
- Package name should be: `com.laundrylocker.mobile`

### Need to verify your current SHA?
Run this command:
```bash
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```
