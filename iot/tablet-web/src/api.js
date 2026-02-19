/**
 * API Service - Gọi backend APIs cho kiosk tablet
 * Base URL cấu hình tại đây
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://192.168.1.10:8080';

async function request(method, path, body = null, token = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json();
  return data;
}

// ===== Auth =====
export const sendOtp = (email) =>
  request('POST', '/api/auth/email/send-otp', { email });

export const verifyOtp = (email, otp) =>
  request('POST', '/api/auth/email/verify-otp', { email, otp });

export const completeRegistration = (tempToken, firstName, lastName, birthday) =>
  request('POST', '/api/auth/email/complete-registration', {
    tempToken, firstName, lastName, birthday,
  });

// ===== Phone Auth =====
export const phoneLogin = (idToken) =>
  request('POST', '/api/auth/phone-login', { idToken });

export const phoneCompleteRegistration = (tempToken, firstName, lastName, birthday) =>
  request('POST', '/api/auth/complete-registration', {
    tempToken, firstName, lastName, birthday,
  });

// ===== Services =====
export const getServices = (token, category = 'LAUNDRY') =>
  request('GET', `/api/services?category=${category}`, null, token);

// ===== Orders =====
export const createOrder = (token, orderData) =>
  request('POST', '/api/orders', orderData, token);

// ===== Payments =====
export const createPayment = (token, orderId, paymentMethod) =>
  request('POST', '/api/payments/create', { orderId, paymentMethod }, token);

// ===== IoT (public) =====
export const verifyPin = (pinCode, boxId, lockerCode) =>
  request('POST', '/api/iot/verify-pin', { pinCode, boxId, lockerCode });

export const unlockBox = (pinCode, boxId, lockerCode) =>
  request('POST', '/api/iot/unlock', { pinCode, boxId, lockerCode });

export const unlockWithCode = (orderId, accessCode, staffName) =>
  request('POST', '/api/iot/unlock-with-code', { orderId, accessCode, staffName });
