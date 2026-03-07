/**
 * API Service - Gọi backend APIs cho kiosk tablet
 * Base URL cấu hình tại đây
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://10.87.20.161:8080';

async function request(method, path, body = null, token = null) {
  const url = `${API_BASE}${path}`;
  console.log(`%c[API] ${method} ${path}`, 'color:#60a5fa;font-weight:bold', {
    url,
    body,
    hasToken: !!token,
  });

  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body) opts.body = JSON.stringify(body);

  try {
    const res = await fetch(url, opts);
    const data = await res.json();

    if (data.success) {
      console.log(`%c[API] ✅ ${method} ${path}`, 'color:#4ade80;font-weight:bold', data);
    } else {
      console.warn(`%c[API] ⚠️ ${method} ${path}`, 'color:#f59e0b;font-weight:bold', data);
    }

    return data;
  } catch (err) {
    console.error(`%c[API] ❌ ${method} ${path}`, 'color:#ef4444;font-weight:bold', err);
    throw err;
  }
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

export const kioskQuickRegister = (tempToken) =>
  request('POST', '/api/auth/kiosk/quick-register', { tempToken });

export const validatePromotionCode = (code, token) =>
  request('GET', `/api/promotions/validate/${code.toUpperCase()}`, null, token);

// ===== Services =====
export const getServices = (token, lockerId, category = 'STORAGE') =>
  request('GET', `/api/services?lockerId=${lockerId}&category=${category}`, null, token);

// ===== Lockers & Boxes =====
export const getAvailableBoxes = (lockerId, token) =>
  request('GET', `/api/lockers/${lockerId}/boxes/available`, null, token);

export const getLockerById = (lockerId, token) =>
  request('GET', `/api/lockers/${lockerId}`, null, token);

// ===== Orders =====
export const createOrder = (token, orderData) =>
  request('POST', '/api/orders', orderData, token);

// ===== Payments =====
export const createPayment = (token, orderId, paymentMethod) =>
  request('POST', '/api/payments/create', { orderId, paymentMethod }, token);

// ===== IoT (public) =====
export const verifyPin = (pinCode, boxId) =>
  request('POST', '/api/iot/verify-pin', { pinCode, boxId });

export const unlockBox = (pinCode, boxId, actionType) =>
  request('POST', '/api/iot/unlock', { pinCode, boxId, actionType });

export const unlockWithCode = (orderId, accessCode, staffName) => {
  const body = { accessCode };
  if (orderId != null) body.orderId = orderId;
  if (staffName) body.staffName = staffName;
  return request('POST', '/api/iot/unlock-with-code', body);
};

// ===== Order Lookup =====
export const getOrderByPin = (pinCode, token) =>
  request('GET', `/api/orders/pin/${pinCode}`, null, token);

export const getOrderById = (orderId, token) =>
  request('GET', `/api/orders/${orderId}`, null, token);

export const getOrderStatus = (orderId, token) =>
  request('GET', `/api/orders/${orderId}/status`, null, token);

// ===== Order Actions =====
export const confirmOrder = (token, orderId) =>
  request('PUT', `/api/orders/${orderId}/confirm`, null, token);

// ===== All Boxes (incl. occupied) =====
export const getAllBoxes = (lockerId, token) =>
  request('GET', `/api/lockers/${lockerId}/boxes`, null, token);
