import { useState, useEffect, useCallback, useRef } from 'react';
import * as api from './api';
import { setupRecaptcha, sendPhoneOtp } from './firebase';
import './App.css';

// ============================================
// Config
// ============================================
const LOCKER_CODE = 'LOCKER_01';
const BOX_ID = 1;
const LOCKER_ID = 1;
const AUTO_HOME_SEC = 20;

// ============================================
// App
// ============================================
export default function App() {
  const [screen, setScreen] = useState('home');
  const [history, setHistory] = useState(['home']);
  const [jwt, setJwt] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loginMethod, setLoginMethod] = useState('phone');
  const [tempToken, setTempToken] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedSvcs, setSelectedSvcs] = useState([]);
  const [services, setServices] = useState([]);
  const [orderId, setOrderId] = useState(null);
  const [orderPin, setOrderPin] = useState('');
  const [orderCode, setOrderCode] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [countdown, setCountdown] = useState(0);
  const cdRef = useRef(null);

  // Navigate
  const go = useCallback((s) => {
    setScreen(s);
    setHistory(h => [...h, s]);
  }, []);

  const back = useCallback(() => {
    setHistory(h => {
      if (h.length <= 1) return h;
      const newH = h.slice(0, -1);
      setScreen(newH[newH.length - 1]);
      return newH;
    });
  }, []);

  const goHome = useCallback(() => {
    setJwt(''); setEmail(''); setPhone(''); setLoginMethod('phone'); setTempToken(''); setUserName('');
    setSelectedSvcs([]); setServices([]); setOrderId(null);
    setOrderPin(''); setOrderCode(''); setTotalPrice(0);
    setScreen('home'); setHistory(['home']);
    if (cdRef.current) clearInterval(cdRef.current);
  }, []);

  const showSuccess = useCallback((title, msg) => {
    setSuccessTitle(title);
    setSuccessMsg(msg);
    go('success');
    let sec = AUTO_HOME_SEC;
    setCountdown(sec);
    if (cdRef.current) clearInterval(cdRef.current);
    cdRef.current = setInterval(() => {
      sec--;
      setCountdown(sec);
      if (sec <= 0) { clearInterval(cdRef.current); goHome(); }
    }, 1000);
  }, [go, goHome]);

  return (
    <>
      {screen === 'home' && <HomeScreen go={go} />}
      {screen === 'login' && <LoginScreen go={go} goHome={goHome} email={email} setEmail={setEmail} phone={phone} setPhone={setPhone} loginMethod={loginMethod} setLoginMethod={setLoginMethod} />}
      {screen === 'otp' && <OtpScreen go={go} back={back} email={email} setJwt={setJwt} setTempToken={setTempToken} setUserName={setUserName} />}
      {screen === 'phone-otp' && <PhoneOtpScreen go={go} back={back} phone={phone} setJwt={setJwt} setTempToken={setTempToken} setUserName={setUserName} />}
      {screen === 'register' && <RegisterScreen go={go} goHome={goHome} tempToken={tempToken} setJwt={setJwt} setUserName={setUserName} loginMethod={loginMethod} />}
      {screen === 'services' && <ServicesScreen go={go} goHome={goHome} jwt={jwt} userName={userName} services={services} setServices={setServices} selectedSvcs={selectedSvcs} setSelectedSvcs={setSelectedSvcs} />}
      {screen === 'order-info' && <OrderInfoScreen go={go} back={back} jwt={jwt} selectedSvcs={selectedSvcs} setOrderId={setOrderId} setOrderPin={setOrderPin} setOrderCode={setOrderCode} setTotalPrice={setTotalPrice} />}
      {screen === 'payment' && <PaymentScreen go={go} goHome={goHome} jwt={jwt} orderId={orderId} orderPin={orderPin} orderCode={orderCode} totalPrice={totalPrice} showSuccess={showSuccess} />}
      {screen === 'pin' && <PinScreen goHome={goHome} showSuccess={showSuccess} />}
      {screen === 'staff' && <StaffScreen goHome={goHome} showSuccess={showSuccess} />}
      {screen === 'success' && <SuccessScreen goHome={goHome} title={successTitle} msg={successMsg} countdown={countdown} />}
    </>
  );
}

// ============================================
// Shared Components
// ============================================
function Header({ onBack, title }) {
  return (
    <div className="header">
      <button className="back-btn" onClick={onBack}>←</button>
      <h2>{title}</h2>
    </div>
  );
}

function Msg({ type, text }) {
  if (!text) return null;
  return <div className={`msg msg-${type}`}>{text}</div>;
}

function Btn({ children, onClick, loading, disabled, variant = 'primary', style, id }) {
  return (
    <button id={id} className={`btn btn-${variant}`} onClick={onClick} disabled={loading || disabled} style={style}>
      {loading ? <><span className="spinner" /> Đang xử lý...</> : children}
    </button>
  );
}

// ============================================
// HOME
// ============================================
function HomeScreen({ go }) {
  return (
    <div className="screen">
      <div className="home-logo">
        <span className="icon">🔐</span>
        <h1>LAUNDRY LOCKER</h1>
        <p className="sub">Hệ thống tủ giặt thông minh</p>
      </div>
      <div className="home-status">📡 Kiosk sẵn sàng phục vụ</div>
      <div className="home-actions">
        <Btn onClick={() => go('login')}>📱 Đặt dịch vụ mới</Btn>
        <Btn variant="secondary" onClick={() => go('pin')}>🔢 Nhập mã PIN</Btn>
        <Btn variant="outline" onClick={() => go('staff')}>👷 Mã nhân viên</Btn>
      </div>
      <div className="footer">Powered by Laundry Locker IoT</div>
    </div>
  );
}

// ============================================
// LOGIN (Email + Phone toggle)
// ============================================
function LoginScreen({ go, goHome, email, setEmail, phone, setPhone, loginMethod, setLoginMethod }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const recaptchaReady = useRef(false);

  // Setup reCAPTCHA when switching to phone
  useEffect(() => {
    if (loginMethod === 'phone' && !recaptchaReady.current) {
      try {
        setupRecaptcha('phone-send-btn');
        recaptchaReady.current = true;
      } catch { /* button may not be in DOM yet */ }
    }
  }, [loginMethod]);

  // Cleanup recaptchaReady when switching away
  useEffect(() => {
    if (loginMethod !== 'phone') recaptchaReady.current = false;
  }, [loginMethod]);

  const handleSendEmail = async () => {
    if (!email || !email.includes('@')) { setMsg('Vui lòng nhập email hợp lệ'); return; }
    setLoading(true); setMsg('');
    try {
      const res = await api.sendOtp(email);
      if (res.success) go('otp');
      else setMsg(res.message || 'Lỗi gửi OTP');
    } catch { setMsg('Lỗi kết nối server'); }
    setLoading(false);
  };

  const handleSendPhone = async () => {
    if (!phone || phone.length < 9) { setMsg('Vui lòng nhập số điện thoại hợp lệ'); return; }
    setLoading(true); setMsg('');
    try {
      // Setup reCAPTCHA if not ready
      if (!recaptchaReady.current) {
        setupRecaptcha('phone-send-btn');
        recaptchaReady.current = true;
      }
      // Format to E.164
      let formatted = phone.trim();
      if (formatted.startsWith('0')) formatted = '+84' + formatted.slice(1);
      else if (!formatted.startsWith('+')) formatted = '+84' + formatted;

      const confirmation = await sendPhoneOtp(formatted);
      window.confirmationResult = confirmation;
      go('phone-otp');
    } catch (err) {
      console.error('Firebase phone OTP error:', err);
      setMsg(err.message || 'Lỗi gửi OTP. Vui lòng thử lại.');
      // Reset reCAPTCHA on error
      recaptchaReady.current = false;
    }
    setLoading(false);
  };

  return (
    <div className="screen">
      <Header onBack={goHome} title="Đăng nhập" />
      <div className="login-tabs">
        <div className={`login-tab ${loginMethod === 'phone' ? 'active' : ''}`} onClick={() => { setLoginMethod('phone'); setMsg(''); }}>
          📱 Số điện thoại
        </div>
        <div className={`login-tab ${loginMethod === 'email' ? 'active' : ''}`} onClick={() => { setLoginMethod('email'); setMsg(''); }}>
          📧 Email
        </div>
      </div>

      {loginMethod === 'phone' ? (
        <>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
            Nhập số điện thoại để nhận mã OTP xác thực
          </p>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input className="input" type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/[^0-9+]/g, ''))}
              placeholder="0901234567" inputMode="tel" autoComplete="tel"
              onKeyDown={e => e.key === 'Enter' && handleSendPhone()} />
          </div>
          <Btn id="phone-send-btn" onClick={handleSendPhone} loading={loading}>📱 Gửi mã OTP</Btn>
        </>
      ) : (
        <>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
            Nhập email để nhận mã OTP xác thực
          </p>
          <div className="form-group">
            <label>Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="example@gmail.com" autoComplete="email" onKeyDown={e => e.key === 'Enter' && handleSendEmail()} />
          </div>
          <Btn onClick={handleSendEmail} loading={loading}>📧 Gửi mã OTP</Btn>
        </>
      )}
      {msg && <Msg type="error" text={msg} />}
    </div>
  );
}

// ============================================
// PHONE OTP (Firebase verification)
// ============================================
function PhoneOtpScreen({ go, back, phone, setJwt, setTempToken, setUserName }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleVerify = async () => {
    if (otp.length !== 6) { setMsg('Vui lòng nhập đủ 6 số OTP'); return; }
    setLoading(true); setMsg('');
    try {
      // Verify OTP with Firebase
      const confirmation = window.confirmationResult;
      if (!confirmation) { setMsg('Phiên đã hết hạn. Vui lòng quay lại.'); setLoading(false); return; }

      const userCredential = await confirmation.confirm(otp);
      const idToken = await userCredential.user.getIdToken();

      // Send Firebase ID token to backend
      const res = await api.phoneLogin(idToken);
      if (res.success && res.data) {
        if (res.data.newUser || res.data.isNewUser) {
          setTempToken(res.data.tempToken);
          go('register');
        } else {
          setJwt(res.data.accessToken);
          const name = res.data.userInfo?.fullName || phone;
          setUserName(name);
          go('services');
        }
      } else {
        setMsg(res.message || 'Lỗi đăng nhập');
      }
    } catch (err) {
      console.error('Phone OTP verify error:', err);
      if (err.code === 'auth/invalid-verification-code') {
        setMsg('Mã OTP không đúng. Vui lòng thử lại.');
      } else if (err.code === 'auth/code-expired') {
        setMsg('Mã OTP đã hết hạn. Vui lòng quay lại và gửi lại.');
      } else {
        setMsg(err.message || 'Lỗi xác thực');
      }
    }
    setLoading(false);
  };

  return (
    <div className="screen">
      <Header onBack={back} title="Xác thực OTP" />
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}>
        Mã OTP đã gửi đến <strong>{phone}</strong>
      </p>
      <div className="form-group">
        <label>Nhập mã OTP 6 số</label>
        <input className="input" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="123456" maxLength={6} inputMode="numeric"
          style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8, fontWeight: 700 }}
          onKeyDown={e => e.key === 'Enter' && handleVerify()} />
      </div>
      <Btn onClick={handleVerify} loading={loading}>✅ Xác nhận</Btn>
      {msg && <Msg type="error" text={msg} />}
    </div>
  );
}

// ============================================
// OTP
// ============================================
function OtpScreen({ go, back, email, setJwt, setTempToken, setUserName }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleVerify = async () => {
    if (otp.length !== 6) { setMsg('Vui lòng nhập đủ 6 số OTP'); return; }
    setLoading(true); setMsg('');
    try {
      const res = await api.verifyOtp(email, otp);
      if (res.success && res.data) {
        if (res.data.newUser || res.data.isNewUser) {
          setTempToken(res.data.tempToken);
          go('register');
        } else {
          setJwt(res.data.accessToken);
          const name = res.data.userInfo?.fullName || email;
          setUserName(name);
          go('services');
        }
      } else {
        setMsg(res.message || 'OTP không hợp lệ');
      }
    } catch { setMsg('Lỗi kết nối server'); }
    setLoading(false);
  };

  return (
    <div className="screen">
      <Header onBack={back} title="Xác thực OTP" />
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}>
        Mã OTP đã gửi đến <strong>{email}</strong>
      </p>
      <div className="form-group">
        <label>Nhập mã OTP 6 số</label>
        <input className="input" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="123456" maxLength={6} inputMode="numeric"
          style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8, fontWeight: 700 }}
          onKeyDown={e => e.key === 'Enter' && handleVerify()} />
      </div>
      <Btn onClick={handleVerify} loading={loading}>✅ Xác nhận</Btn>
      {msg && <Msg type="error" text={msg} />}
    </div>
  );
}

// ============================================
// REGISTER
// ============================================
function RegisterScreen({ go, goHome, tempToken, setJwt, setUserName, loginMethod }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleRegister = async () => {
    if (!firstName || !lastName || !birthday) { setMsg('Vui lòng nhập đầy đủ thông tin'); return; }
    setLoading(true); setMsg('');
    try {
      // Use different API based on login method
      const registerFn = loginMethod === 'phone'
        ? api.phoneCompleteRegistration
        : api.completeRegistration;
      const res = await registerFn(tempToken, firstName, lastName, birthday);
      if (res.success && res.data) {
        setJwt(res.data.accessToken);
        setUserName(`${lastName} ${firstName}`);
        go('services');
      } else {
        setMsg(res.message || 'Lỗi đăng ký');
      }
    } catch { setMsg('Lỗi kết nối server'); }
    setLoading(false);
  };

  return (
    <div className="screen">
      <Header onBack={goHome} title="Đăng ký tài khoản" />
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
        Tài khoản mới! Vui lòng nhập thông tin cá nhân.
      </p>
      <div className="form-group">
        <label>Họ</label>
        <input className="input" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Nguyễn" />
      </div>
      <div className="form-group">
        <label>Tên</label>
        <input className="input" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Văn A" />
      </div>
      <div className="form-group">
        <label>Ngày sinh</label>
        <input className="input" type="date" value={birthday} onChange={e => setBirthday(e.target.value)} style={{ colorScheme: 'dark' }} />
      </div>
      <Btn onClick={handleRegister} loading={loading}>📝 Đăng ký</Btn>
      {msg && <Msg type="error" text={msg} />}
    </div>
  );
}

// ============================================
// SERVICES
// ============================================
function ServicesScreen({ go, goHome, jwt, userName, services, setServices, selectedSvcs, setSelectedSvcs }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      try {
        const res = await api.getServices(jwt);
        if (!ignore && res.success && res.data) setServices(res.data);
      } catch { /* ignore */ }
      if (!ignore) setLoading(false);
    })();
    return () => { ignore = true; };
  }, [jwt, setServices]);

  const toggle = (id) => {
    setSelectedSvcs(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const fmt = (p) => p != null ? new Intl.NumberFormat('vi-VN').format(p) + 'đ' : '0đ';

  return (
    <div className="screen">
      <Header onBack={goHome} title="Chọn dịch vụ" />
      {userName && <div className="user-info">👤 {userName}</div>}
      <div className="svc-list">
        {loading && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>⏳ Đang tải dịch vụ...</p>}
        {!loading && services.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>Không có dịch vụ</p>}
        {services.map(svc => (
          <div key={svc.id} className={`svc-card ${selectedSvcs.includes(svc.id) ? 'selected' : ''}`} onClick={() => toggle(svc.id)}>
            <div className="svc-check">{selectedSvcs.includes(svc.id) ? '✓' : ''}</div>
            <div className="svc-info">
              <div className="svc-name">{svc.name}</div>
              <div className="svc-price">{fmt(svc.price)} / {svc.unit || 'lần'}</div>
              {svc.description && <div className="svc-desc">{svc.description}</div>}
            </div>
          </div>
        ))}
      </div>
      <Btn onClick={() => go('order-info')} disabled={selectedSvcs.length === 0}>Tiếp tục →</Btn>
    </div>
  );
}

// ============================================
// ORDER INFO
// ============================================
function OrderInfoScreen({ go, back, jwt, selectedSvcs, setOrderId, setOrderPin, setOrderCode, setTotalPrice }) {
  const [note, setNote] = useState('');
  const [recvName, setRecvName] = useState('');
  const [recvPhone, setRecvPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleCreate = async () => {
    setLoading(true); setMsg('');
    try {
      const res = await api.createOrder(jwt, {
        type: 'LAUNDRY',
        lockerId: LOCKER_ID,
        boxId: BOX_ID,
        serviceIds: selectedSvcs,
        customerNote: note || undefined,
        receiverName: recvName || undefined,
        receiverPhone: recvPhone || undefined,
      });
      if (res.success && res.data) {
        setOrderId(res.data.id);
        setOrderPin(res.data.pinCode || '');
        setOrderCode(res.data.orderCode || '');
        setTotalPrice(res.data.totalPrice || 0);
        go('payment');
      } else {
        setMsg(res.data?.message || res.message || 'Lỗi tạo đơn hàng');
      }
    } catch { setMsg('Lỗi kết nối server'); }
    setLoading(false);
  };

  return (
    <div className="screen">
      <Header onBack={back} title="Thông tin đơn hàng" />
      <div className="form-group">
        <label>Ghi chú (tùy chọn)</label>
        <input className="input" value={note} onChange={e => setNote(e.target.value)} placeholder="Ví dụ: Giặt nhẹ tay, không sấy..." />
      </div>
      <div className="divider">Người nhận (tùy chọn)</div>
      <div className="form-group">
        <label>Tên người nhận</label>
        <input className="input" value={recvName} onChange={e => setRecvName(e.target.value)} placeholder="Để trống nếu tự nhận" />
      </div>
      <div className="form-group">
        <label>Số điện thoại người nhận</label>
        <input className="input" type="tel" value={recvPhone} onChange={e => setRecvPhone(e.target.value)} placeholder="0901234567" inputMode="tel" />
      </div>
      <Btn onClick={handleCreate} loading={loading}>📋 Tạo đơn hàng</Btn>
      {msg && <Msg type="error" text={msg} />}
    </div>
  );
}

// ============================================
// PAYMENT
// ============================================
function PaymentScreen({ go, goHome, jwt, orderId, orderPin, orderCode, totalPrice, showSuccess }) {
  const [loading, setLoading] = useState('');
  const [payUrl, setPayUrl] = useState('');
  const [msg, setMsg] = useState('');

  const fmt = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

  const skipPay = async () => {
    setLoading('skip');
    try {
      const res = await api.unlockBox(orderPin, BOX_ID, LOCKER_CODE);
      if (res.success || res.data?.success) {
        showSuccess('Tủ đã mở!', `Vui lòng bỏ đồ vào box và đóng cửa.\nPIN: ${orderPin}`);
      } else {
        setMsg(res.data?.message || res.message || 'Lỗi mở tủ');
      }
    } catch { setMsg('Lỗi kết nối'); }
    setLoading('');
  };

  const payOnline = async (method) => {
    setLoading(method);
    try {
      const res = await api.createPayment(jwt, orderId, method);
      if (res.success && res.data?.paymentUrl) {
        setPayUrl(res.data.paymentUrl);
      } else {
        setMsg(res.data?.message || res.message || 'Lỗi tạo thanh toán');
      }
    } catch { setMsg('Lỗi kết nối'); }
    setLoading('');
  };

  const openAfterPay = async () => {
    setLoading('open');
    try {
      const res = await api.unlockBox(orderPin, BOX_ID, LOCKER_CODE);
      if (res.success || res.data?.success) {
        showSuccess('Thanh toán thành công!', 'Tủ đã mở. Vui lòng bỏ đồ vào và đóng cửa.');
      } else {
        setMsg(res.data?.message || res.message || 'Lỗi mở tủ');
      }
    } catch { setMsg('Lỗi kết nối'); }
    setLoading('');
  };

  return (
    <div className="screen">
      <Header onBack={goHome} title="Thanh toán" />
      <div className="order-sum">
        <p>📋 Mã đơn: <strong>{orderCode}</strong></p>
        <p>🔑 PIN: <strong>{orderPin}</strong></p>
        <p>💰 Tổng: <strong>{fmt(totalPrice)}</strong></p>
      </div>
      <Btn variant="secondary" onClick={skipPay} loading={loading === 'skip'} style={{ marginBottom: 12 }}>
        🔓 Mở tủ trước — Thanh toán sau
      </Btn>
      <div className="divider">Hoặc thanh toán ngay</div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variant="secondary" onClick={() => payOnline('VNPAY')} loading={loading === 'VNPAY'} style={{ flex: 1 }}>
          💳 VNPay
        </Btn>
        <Btn variant="secondary" onClick={() => payOnline('MOMO')} loading={loading === 'MOMO'} style={{ flex: 1 }}>
          📱 MoMo
        </Btn>
      </div>
      {payUrl && (
        <div className="pay-link">
          <p style={{ color: '#c8d6e5', fontSize: 13, marginBottom: 8 }}>📱 Quét QR hoặc mở link để thanh toán:</p>
          <a href={payUrl} target="_blank" rel="noreferrer">{payUrl}</a>
          <p>Sau khi thanh toán xong, nhấn nút bên dưới.</p>
        </div>
      )}
      {payUrl && (
        <Btn onClick={openAfterPay} loading={loading === 'open'} style={{ marginTop: 12 }}>
          🔓 Đã thanh toán — Mở tủ
        </Btn>
      )}
      {msg && <Msg type="error" text={msg} />}
    </div>
  );
}

// ============================================
// PIN
// ============================================
function PinScreen({ goHome, showSuccess }) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [pinState, setPinState] = useState(''); // '', 'error', 'success'
  const [msg, setMsg] = useState('');

  const pressKey = (num) => {
    if (pin.length >= 6) return;
    const newPin = pin + num;
    setPin(newPin);
    setPinState('');
    setMsg('');
    if (newPin.length === 6) setTimeout(() => submitPin(newPin), 300);
  };

  const clearAll = () => { setPin(''); setPinState(''); setMsg(''); };
  const backspace = () => { setPin(p => p.slice(0, -1)); setPinState(''); };

  const submitPin = async (p) => {
    const code = p || pin;
    if (code.length !== 6) return;
    setLoading(true);
    try {
      // First verify, then unlock
      const verifyRes = await api.verifyPin(code, BOX_ID, LOCKER_CODE);
      if (verifyRes.success && verifyRes.data?.valid) {
        const unlockRes = await api.unlockBox(code, BOX_ID, LOCKER_CODE);
        if (unlockRes.success || unlockRes.data?.success) {
          setPinState('success');
          setTimeout(() => showSuccess('Đã mở khóa!', unlockRes.data?.message || 'Hộp đã được mở. Tự khóa sau 5 giây.'), 500);
        } else {
          setPinState('error');
          setMsg(unlockRes.data?.message || 'Lỗi mở khóa');
          setTimeout(clearAll, 2000);
        }
      } else {
        setPinState('error');
        setMsg(verifyRes.data?.message || verifyRes.message || 'Mã PIN không hợp lệ');
        setTimeout(clearAll, 2000);
      }
    } catch {
      setPinState('error');
      setMsg('Lỗi kết nối server');
      setTimeout(clearAll, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="screen">
      <Header onBack={goHome} title="Nhập mã PIN" />
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8, textAlign: 'center' }}>
        Nhập mã PIN 6 số để mở tủ
      </p>
      <div className="pin-row">
        {[0,1,2,3,4,5].map(i => (
          <div key={i} className={`pin-box ${pin.length > i ? 'filled' : ''} ${pinState}`}>
            {pin[i] ? '●' : ''}
          </div>
        ))}
      </div>
      <div className="numpad">
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <div key={n} className="key" onClick={() => pressKey(String(n))}>{n}</div>
        ))}
        <div className="key fn" onClick={clearAll}>Xóa</div>
        <div className="key" onClick={() => pressKey('0')}>0</div>
        <div className="key fn" onClick={backspace}>⌫</div>
      </div>
      <Btn onClick={() => submitPin(pin)} loading={loading} disabled={pin.length < 6} style={{ marginTop: 16 }}>
        🔓 Mở khóa
      </Btn>
      {msg && <Msg type="error" text={msg} />}
    </div>
  );
}

// ============================================
// STAFF
// ============================================
function StaffScreen({ goHome, showSuccess }) {
  const [oid, setOid] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleUnlock = async () => {
    if (!oid || !code) { setMsg('Vui lòng nhập Order ID và Access Code'); return; }
    setLoading(true); setMsg('');
    try {
      const res = await api.unlockWithCode(parseInt(oid), code, name || undefined);
      if (res.success && res.data?.success) {
        showSuccess('Đã mở khóa!', res.data.message || 'Mở khóa thành công cho nhân viên.');
      } else {
        setMsg(res.data?.message || res.message || 'Mã không hợp lệ');
      }
    } catch { setMsg('Lỗi kết nối server'); }
    setLoading(false);
  };

  return (
    <div className="screen">
      <Header onBack={goHome} title="Mã nhân viên" />
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
        Nhập Order ID và mã truy cập nhân viên
      </p>
      <div className="form-group">
        <label>Order ID</label>
        <input className="input" type="number" value={oid} onChange={e => setOid(e.target.value)} placeholder="Ví dụ: 123" inputMode="numeric" />
      </div>
      <div className="form-group">
        <label>Access Code</label>
        <input className="input" value={code} onChange={e => setCode(e.target.value)} placeholder="Nhập mã truy cập" />
      </div>
      <div className="form-group">
        <label>Tên nhân viên (tùy chọn)</label>
        <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Tên nhân viên" />
      </div>
      <Btn onClick={handleUnlock} loading={loading}>🔓 Mở khóa</Btn>
      {msg && <Msg type="error" text={msg} />}
    </div>
  );
}

// ============================================
// SUCCESS
// ============================================
function SuccessScreen({ goHome, title, msg, countdown }) {
  return (
    <div className="screen">
      <div className="success-box">
        <span className="icon">✅</span>
        <h2>{title}</h2>
        <p>{msg}</p>
      </div>
      <div className="countdown">Về trang chủ sau {countdown}s</div>
      <Btn variant="secondary" onClick={goHome} style={{ marginTop: 20 }}>🏠 Về trang chủ</Btn>
    </div>
  );
}
