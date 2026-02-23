// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBSP18zNPDCdi1aS9cwtaaUbS8cR81OFrI",
    authDomain: "laundry-locker-19a9d.firebaseapp.com",
    projectId: "laundry-locker-19a9d",
    storageBucket: "laundry-locker-19a9d.firebasestorage.app",
    messagingSenderId: "1007589685877",
    appId: "1:1007589685877:web:f258a35d706034b740963c",
    measurementId: "G-JH37YDBZ5L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// For local development ONLY: bypass reCAPTCHA verification
// auth.settings.appVerificationDisabledForTesting = true;

///

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

export { auth, RecaptchaVerifier, signInWithPhoneNumber };
