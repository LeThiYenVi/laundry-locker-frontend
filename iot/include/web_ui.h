/**
 * IoT Kiosk Web UI - Login + PIN Unlock
 * 
 * Luồng đơn giản cho ESP8266 (RAM hạn chế):
 * Đăng nhập (email OTP) → Nhập PIN 6 số → Mở khóa tủ
 * 
 * HTML/CSS/JS stored in PROGMEM flash memory
 */

#ifndef WEB_UI_H
#define WEB_UI_H

#include <Arduino.h>

const char LOCKER_UI_HTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<title>Laundry Locker</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;background:linear-gradient(135deg,#0a1628,#1a2a4a,#0d1f3c);color:#e0e8f0;min-height:100vh;overflow-x:hidden}
.app{max-width:420px;margin:0 auto;padding:16px;min-height:100vh;display:flex;flex-direction:column}
.screen{display:none;flex:1;animation:fadeIn .3s ease}
.screen.active{display:flex;flex-direction:column}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

.hdr{display:flex;align-items:center;gap:12px;margin-bottom:20px;padding:8px 0}
.hdr .back{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;color:#7a8ba8;transition:all .2s}
.hdr .back:hover{background:rgba(255,255,255,.15);color:#fff}
.hdr h2{font-size:17px;font-weight:600;color:#c8d6e5}

.home-logo{text-align:center;margin:40px 0 20px}
.home-logo .icon{font-size:64px;display:block;margin-bottom:12px}
.home-logo h1{font-size:26px;font-weight:800;background:linear-gradient(135deg,#48cae4,#00b4d8,#0077b6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:1px}
.home-logo .sub{color:#5a6f8a;font-size:14px;margin-top:6px}
.home-status{text-align:center;padding:12px;background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.2);border-radius:10px;margin:16px 0;color:#4ade80;font-size:13px}
.home-actions{display:flex;flex-direction:column;gap:12px;margin-top:24px}

.btn{width:100%;padding:15px;border:none;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:10px}
.btn:active{transform:scale(.97)}
.btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-p{background:linear-gradient(135deg,#00b4d8,#0077b6);color:#fff;box-shadow:0 4px 15px rgba(0,180,216,.3)}
.btn-p:hover:not(:disabled){box-shadow:0 6px 20px rgba(0,180,216,.4)}
.btn-s{background:rgba(255,255,255,.06);color:#c8d6e5;border:1.5px solid rgba(255,255,255,.12)}
.btn-s:hover:not(:disabled){background:rgba(255,255,255,.1)}

.form-group{margin-bottom:16px}
.form-group label{display:block;margin-bottom:6px;font-size:13px;color:#7a8ba8;font-weight:500}
.inp{width:100%;padding:14px 16px;background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.1);border-radius:12px;color:#e0e8f0;font-size:15px;outline:none;transition:border-color .2s}
.inp:focus{border-color:#00b4d8}
.inp::placeholder{color:#4a5a70}

.msg{padding:12px 14px;border-radius:10px;margin-top:10px;font-size:13px;display:none;line-height:1.4}
.msg.error{background:rgba(239,68,68,.12);color:#f87171;border:1px solid rgba(239,68,68,.2);display:block}
.msg.success{background:rgba(34,197,94,.12);color:#4ade80;border:1px solid rgba(34,197,94,.2);display:block}

.pin-row{display:flex;gap:8px;justify-content:center;margin:20px 0}
.pin-input{width:46px;height:56px;text-align:center;font-size:22px;font-weight:700;background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.12);border-radius:12px;color:#fff;outline:none;pointer-events:none}
.pin-input.filled{border-color:#00b4d8;background:rgba(0,180,216,.08)}
.pin-input.error{border-color:#f87171;background:rgba(239,68,68,.08);animation:shake .4s}
.pin-input.success{border-color:#4ade80;background:rgba(34,197,94,.08)}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}

.numpad{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:280px;margin:0 auto}
.numpad .key{padding:16px;text-align:center;font-size:22px;font-weight:600;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;cursor:pointer;color:#e0e8f0;transition:all .15s;user-select:none}
.numpad .key:active{background:rgba(0,180,216,.2);transform:scale(.95)}
.numpad .key.fn{font-size:14px;color:#7a8ba8}

.success-box{text-align:center;margin:40px 0}
.success-box .icon{font-size:72px;display:block;margin-bottom:16px}
.success-box h2{font-size:22px;color:#4ade80;margin-bottom:8px}
.success-box p{color:#7a8ba8;font-size:14px;line-height:1.5}
.countdown{font-size:13px;color:#5a6f8a;margin-top:16px;text-align:center}

.user-info{padding:10px 14px;background:rgba(0,180,216,.08);border:1px solid rgba(0,180,216,.15);border-radius:10px;margin-bottom:16px;font-size:13px;color:#48cae4;display:flex;align-items:center;gap:8px}

.spinner{display:inline-block;width:18px;height:18px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

.footer{text-align:center;padding:12px 0;color:#3a4a60;font-size:11px;margin-top:auto}
</style>
</head>
<body>
<div class="app">

<!-- ==================== HOME ==================== -->
<div id="screen-home" class="screen active">
  <div class="home-logo">
    <span class="icon">🔐</span>
    <h1>LAUNDRY LOCKER</h1>
    <p class="sub">Hệ thống tủ giặt thông minh</p>
  </div>
  <div class="home-status" id="deviceStatus">📡 Box #<span id="homeBoxId">-</span> — Đang kết nối...</div>
  <div class="home-actions">
    <button class="btn btn-p" onclick="go('login')">🔑 Đăng nhập & Mở khóa</button>
  </div>
  <div class="footer">Powered by Laundry Locker IoT</div>
</div>

<!-- ==================== LOGIN ==================== -->
<div id="screen-login" class="screen">
  <div class="hdr"><span class="back" onclick="goHome()">←</span><h2>Đăng nhập</h2></div>
  <p style="color:#7a8ba8;font-size:13px;margin-bottom:20px">Nhập email để nhận mã OTP xác thực</p>
  <div class="form-group">
    <label>Email</label>
    <input type="email" class="inp" id="emailInput" placeholder="example@gmail.com" autocomplete="email">
  </div>
  <button class="btn btn-p" id="btnSendOtp" onclick="sendOtp()">📧 Gửi mã OTP</button>
  <div class="msg" id="loginMsg"></div>
</div>

<!-- ==================== OTP ==================== -->
<div id="screen-otp" class="screen">
  <div class="hdr"><span class="back" onclick="back()">←</span><h2>Xác thực OTP</h2></div>
  <p style="color:#7a8ba8;font-size:13px;margin-bottom:8px">Mã OTP đã gửi đến <strong id="otpEmail"></strong></p>
  <div class="form-group">
    <label>Nhập mã OTP 6 số</label>
    <input type="text" class="inp" id="otpInput" placeholder="123456" maxlength="6" pattern="\d{6}" inputmode="numeric" style="text-align:center;font-size:24px;letter-spacing:8px;font-weight:700">
  </div>
  <button class="btn btn-p" id="btnVerifyOtp" onclick="verifyOtp()">✅ Xác nhận</button>
  <div class="msg" id="otpMsg"></div>
</div>

<!-- ==================== REGISTER ==================== -->
<div id="screen-register" class="screen">
  <div class="hdr"><span class="back" onclick="goHome()">←</span><h2>Đăng ký tài khoản</h2></div>
  <p style="color:#7a8ba8;font-size:13px;margin-bottom:20px">Tài khoản mới! Vui lòng nhập thông tin để hoàn tất đăng ký.</p>
  <div class="form-group">
    <label>Họ</label>
    <input type="text" class="inp" id="regLastName" placeholder="Nguyen">
  </div>
  <div class="form-group">
    <label>Tên</label>
    <input type="text" class="inp" id="regFirstName" placeholder="Van A">
  </div>
  <div class="form-group">
    <label>Ngày sinh</label>
    <input type="date" class="inp" id="regBirthday" style="color-scheme:dark">
  </div>
  <button class="btn btn-p" id="btnRegister" onclick="completeRegistration()">📝 Đăng ký</button>
  <div class="msg" id="regMsg"></div>
</div>

<!-- ==================== PIN ==================== -->
<div id="screen-pin" class="screen">
  <div class="hdr"><span class="back" onclick="goHome()">←</span><h2>Nhập mã PIN</h2></div>
  <div class="user-info" id="userInfo">👤 <span id="userName"></span></div>
  <p style="color:#7a8ba8;font-size:13px;margin-bottom:8px;text-align:center">Nhập mã PIN 6 số để mở tủ</p>
  <div class="pin-row" id="pinRow">
    <input type="text" class="pin-input" readonly>
    <input type="text" class="pin-input" readonly>
    <input type="text" class="pin-input" readonly>
    <input type="text" class="pin-input" readonly>
    <input type="text" class="pin-input" readonly>
    <input type="text" class="pin-input" readonly>
  </div>
  <div class="numpad">
    <div class="key" onclick="pressKey('1')">1</div>
    <div class="key" onclick="pressKey('2')">2</div>
    <div class="key" onclick="pressKey('3')">3</div>
    <div class="key" onclick="pressKey('4')">4</div>
    <div class="key" onclick="pressKey('5')">5</div>
    <div class="key" onclick="pressKey('6')">6</div>
    <div class="key" onclick="pressKey('7')">7</div>
    <div class="key" onclick="pressKey('8')">8</div>
    <div class="key" onclick="pressKey('9')">9</div>
    <div class="key fn" onclick="clearPin()">Xóa</div>
    <div class="key" onclick="pressKey('0')">0</div>
    <div class="key fn" onclick="pinBackspace()">⌫</div>
  </div>
  <button class="btn btn-p" id="btnPinUnlock" onclick="handlePinUnlock()" disabled style="margin-top:16px">🔓 Mở khóa</button>
  <div class="msg" id="pinMsg"></div>
</div>

<!-- ==================== SUCCESS ==================== -->
<div id="screen-success" class="screen">
  <div class="success-box">
    <span class="icon">✅</span>
    <h2 id="successTitle">Thành công!</h2>
    <p id="successMsg">Tủ đã mở. Hộp sẽ tự khóa sau 5 giây.</p>
  </div>
  <div class="countdown" id="countdown"></div>
  <button class="btn btn-s" onclick="goHome()" style="margin-top:20px">🏠 Về trang chủ</button>
</div>

</div>

<script>
// State
let jwt = '';
let screenHistory = ['home'];
let boxId = 1;
let pinIdx = 0;
let cdTimer = null;

// Init
async function init() {
  try {
    const res = await fetch('/api/info');
    const d = await res.json();
    boxId = d.boxId || 1;
    document.getElementById('homeBoxId').textContent = boxId;
    const s = document.getElementById('deviceStatus');
    s.innerHTML = '📡 Box #' + boxId + ' — ' + (d.status === 'UNLOCKED' ? '🔓 Đang mở' : '🔒 Sẵn sàng');
  } catch(e) {
    const s = document.getElementById('deviceStatus');
    s.innerHTML = '⚠️ Lỗi kết nối thiết bị';
    s.style.borderColor = 'rgba(239,68,68,.3)';
    s.style.background = 'rgba(239,68,68,.1)';
    s.style.color = '#f87171';
  }
}

// Navigation
function go(name) {
  const cur = document.querySelector('.screen.active');
  if (cur) cur.classList.remove('active');
  document.getElementById('screen-' + name).classList.add('active');
  screenHistory.push(name);
}

function back() {
  if (screenHistory.length <= 1) return;
  screenHistory.pop();
  const prev = screenHistory[screenHistory.length - 1];
  const cur = document.querySelector('.screen.active');
  if (cur) cur.classList.remove('active');
  document.getElementById('screen-' + prev).classList.add('active');
}

function goHome() {
  jwt = '';
  pinIdx = 0;
  screenHistory = ['home'];
  if (cdTimer) { clearInterval(cdTimer); cdTimer = null; }
  document.querySelectorAll('.msg').forEach(m => { m.className = 'msg'; m.style.display = 'none'; });
  document.querySelectorAll('.inp').forEach(i => i.value = '');
  clearPin();
  const cur = document.querySelector('.screen.active');
  if (cur) cur.classList.remove('active');
  document.getElementById('screen-home').classList.add('active');
  init();
}

// UI helpers
function showMsg(id, type, text) {
  const el = document.getElementById(id);
  el.className = 'msg ' + type;
  el.textContent = text;
  el.style.display = 'block';
}

function setLoading(btnId, on) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = on;
  if (on) { btn._t = btn.innerHTML; btn.innerHTML = '<span class="spinner"></span> Đang xử lý...'; }
  else { btn.innerHTML = btn._t || 'OK'; }
}

// ========== LOGIN (Email OTP) ==========

async function sendOtp() {
  const email = document.getElementById('emailInput').value.trim();
  if (!email || !email.includes('@')) {
    showMsg('loginMsg', 'error', 'Vui lòng nhập email hợp lệ');
    return;
  }
  setLoading('btnSendOtp', true);
  try {
    const res = await fetch('/api/proxy/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (data.success) {
      window._email = email;
      document.getElementById('otpEmail').textContent = email;
      go('otp');
    } else {
      showMsg('loginMsg', 'error', data.message || 'Lỗi gửi OTP');
    }
  } catch(e) {
    showMsg('loginMsg', 'error', 'Lỗi kết nối server');
  }
  setLoading('btnSendOtp', false);
}

async function verifyOtp() {
  const otp = document.getElementById('otpInput').value.trim();
  if (otp.length !== 6) {
    showMsg('otpMsg', 'error', 'Vui lòng nhập đủ 6 số OTP');
    return;
  }
  setLoading('btnVerifyOtp', true);
  try {
    const res = await fetch('/api/proxy/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: window._email, otp })
    });
    const data = await res.json();
    if (data.success && data.data) {
      if (data.data.newUser || data.data.isNewUser) {
        // New user → go to registration
        window._tempToken = data.data.tempToken;
        go('register');
      } else {
        jwt = data.data.accessToken;
        const name = (data.data.userInfo && data.data.userInfo.fullName) || window._email;
        document.getElementById('userName').textContent = name;
        go('pin');
      }
    } else {
      showMsg('otpMsg', 'error', data.message || 'OTP không hợp lệ');
    }
  } catch(e) {
    showMsg('otpMsg', 'error', 'Lỗi kết nối server');
  }
  setLoading('btnVerifyOtp', false);
}

// ========== REGISTRATION ==========

async function completeRegistration() {
  const firstName = document.getElementById('regFirstName').value.trim();
  const lastName = document.getElementById('regLastName').value.trim();
  const birthday = document.getElementById('regBirthday').value;
  if (!firstName || !lastName || !birthday) {
    showMsg('regMsg', 'error', 'Vui lòng nhập đầy đủ thông tin');
    return;
  }
  setLoading('btnRegister', true);
  try {
    const res = await fetch('/api/proxy/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tempToken: window._tempToken,
        firstName: firstName,
        lastName: lastName,
        birthday: birthday
      })
    });
    const data = await res.json();
    if (data.success && data.data) {
      jwt = data.data.accessToken;
      document.getElementById('userName').textContent = lastName + ' ' + firstName;
      go('pin');
    } else {
      showMsg('regMsg', 'error', data.message || 'Lỗi đăng ký');
    }
  } catch(e) {
    showMsg('regMsg', 'error', 'Lỗi kết nối server');
  }
  setLoading('btnRegister', false);
}

// ========== PIN UNLOCK ==========

function pressKey(num) {
  const inputs = document.querySelectorAll('#pinRow .pin-input');
  if (pinIdx >= 6) return;
  inputs[pinIdx].value = num;
  inputs[pinIdx].classList.add('filled');
  pinIdx++;
  document.getElementById('btnPinUnlock').disabled = pinIdx < 6;
  if (pinIdx === 6) setTimeout(() => handlePinUnlock(), 300);
}

function pinBackspace() {
  const inputs = document.querySelectorAll('#pinRow .pin-input');
  if (pinIdx <= 0) return;
  pinIdx--;
  inputs[pinIdx].value = '';
  inputs[pinIdx].classList.remove('filled', 'error', 'success');
  document.getElementById('btnPinUnlock').disabled = true;
}

function clearPin() {
  const inputs = document.querySelectorAll('#pinRow .pin-input');
  if (!inputs.length) return;
  inputs.forEach(i => { i.value = ''; i.classList.remove('filled', 'error', 'success'); });
  pinIdx = 0;
  const btn = document.getElementById('btnPinUnlock');
  if (btn) btn.disabled = true;
}

async function handlePinUnlock() {
  const inputs = document.querySelectorAll('#pinRow .pin-input');
  const pin = Array.from(inputs).map(i => i.value).join('');
  if (pin.length !== 6) return;
  setLoading('btnPinUnlock', true);
  try {
    const res = await fetch('/verify-and-unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinCode: pin })
    });
    const data = await res.json();
    if (data.success) {
      inputs.forEach(i => i.classList.add('success'));
      setTimeout(() => {
        document.getElementById('successTitle').textContent = 'Đã mở khóa!';
        document.getElementById('successMsg').textContent = data.message || 'Hộp đã được mở. Tự khóa sau 5 giây.';
        go('success');
        let sec = 15;
        const cd = document.getElementById('countdown');
        cd.textContent = 'Về trang chủ sau ' + sec + 's';
        if (cdTimer) clearInterval(cdTimer);
        cdTimer = setInterval(() => {
          sec--;
          cd.textContent = 'Về trang chủ sau ' + sec + 's';
          if (sec <= 0) { clearInterval(cdTimer); cdTimer = null; goHome(); }
        }, 1000);
      }, 500);
    } else {
      inputs.forEach(i => i.classList.add('error'));
      showMsg('pinMsg', 'error', data.message || 'Mã PIN không hợp lệ');
      setTimeout(() => clearPin(), 2000);
    }
  } catch(e) {
    showMsg('pinMsg', 'error', 'Lỗi kết nối server');
  }
  setLoading('btnPinUnlock', false);
}

window.onload = init;
</script>
</body>
</html>
)rawliteral";

#endif // WEB_UI_H
