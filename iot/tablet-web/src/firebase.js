/**
 * Firebase Configuration for Tablet Web Kiosk
 * Used for Phone OTP Authentication via Firebase Auth
 */
import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCqdITzgaApbsPeFn2aAbtKbOEVLIQvYo8',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'laundry-locker-19a9d.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'laundry-locker-19a9d',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'laundry-locker-19a9d.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1007589685877',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Use Vietnamese for OTP SMS
auth.languageCode = 'vi';

/**
 * Setup invisible reCAPTCHA verifier on a button element.
 * Must be called before signInWithPhoneNumber.
 * @param {string} buttonId - DOM element ID for the reCAPTCHA container
 * @returns {RecaptchaVerifier}
 */
export function setupRecaptcha(buttonId) {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }
  window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
    size: 'invisible',
    callback: () => {},
    'expired-callback': () => {
      window.recaptchaVerifier = null;
    },
  });
  return window.recaptchaVerifier;
}

/**
 * Send OTP to phone number via Firebase
 * @param {string} phoneNumber - Phone in E.164 format, e.g. +84901234567
 * @returns {Promise<import('firebase/auth').ConfirmationResult>}
 */
export async function sendPhoneOtp(phoneNumber) {
  const verifier = window.recaptchaVerifier;
  if (!verifier) throw new Error('reCAPTCHA chưa được khởi tạo');
  const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
  return result;
}

export { auth };
