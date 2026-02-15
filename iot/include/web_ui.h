/**
 * Locker Kiosk Web UI
 * 
 * Trang web HTML/CSS/JS phục vụ bởi ESP8266 cho giao diện nhập PIN
 * Lưu trong PROGMEM để tiết kiệm RAM
 */

#ifndef WEB_UI_H
#define WEB_UI_H

#include <Arduino.h>

const char LOCKER_UI_HTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Laundry Locker</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #0a1628 0%, #1a2a4a 50%, #0d1f3c 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #e0e8f0;
            overflow: hidden;
        }

        .container {
            width: 100%;
            max-width: 420px;
            padding: 24px;
            text-align: center;
        }

        /* Header */
        .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 16px;
            background: linear-gradient(135deg, #00b4d8, #0077b6);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            box-shadow: 0 8px 32px rgba(0, 180, 216, 0.3);
        }

        h1 {
            font-size: 24px;
            font-weight: 800;
            background: linear-gradient(135deg, #00b4d8, #48cae4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 4px;
        }

        .subtitle {
            font-size: 14px;
            color: #7a8ba8;
            margin-bottom: 32px;
        }

        /* Status bar */
        .status-bar {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 10px 20px;
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            margin-bottom: 28px;
            font-size: 13px;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #00c853;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
        }

        /* PIN Input */
        .pin-label {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #b0c4de;
        }

        .pin-container {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-bottom: 28px;
        }

        .pin-input {
            width: 48px;
            height: 60px;
            background: rgba(255,255,255,0.08);
            border: 2px solid rgba(255,255,255,0.15);
            border-radius: 14px;
            color: #fff;
            font-size: 24px;
            font-weight: 700;
            text-align: center;
            outline: none;
            transition: all 0.3s ease;
            -webkit-appearance: none;
        }

        .pin-input:focus {
            border-color: #00b4d8;
            background: rgba(0, 180, 216, 0.1);
            box-shadow: 0 0 20px rgba(0, 180, 216, 0.2);
            transform: scale(1.05);
        }

        .pin-input.filled {
            border-color: #48cae4;
            background: rgba(0, 180, 216, 0.08);
        }

        .pin-input.error {
            border-color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
            animation: shake 0.5s ease;
        }

        .pin-input.success {
            border-color: #22c55e;
            background: rgba(34, 197, 94, 0.1);
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-8px); }
            50% { transform: translateX(8px); }
            75% { transform: translateX(-4px); }
        }

        /* Unlock Button */
        .btn-unlock {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #00b4d8, #0077b6);
            border: none;
            border-radius: 14px;
            color: #fff;
            font-size: 17px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            letter-spacing: 0.5px;
            position: relative;
            overflow: hidden;
        }

        .btn-unlock:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 180, 216, 0.4);
        }

        .btn-unlock:active {
            transform: translateY(0);
        }

        .btn-unlock:disabled {
            background: rgba(255,255,255,0.1);
            color: #5a6a80;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        .btn-unlock.loading {
            pointer-events: none;
        }

        /* Result Message */
        .result {
            margin-top: 20px;
            padding: 16px 20px;
            border-radius: 14px;
            font-size: 15px;
            font-weight: 600;
            display: none;
            animation: slideUp 0.4s ease;
        }

        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .result.success {
            display: block;
            background: rgba(34, 197, 94, 0.15);
            border: 1px solid rgba(34, 197, 94, 0.3);
            color: #4ade80;
        }

        .result.error {
            display: block;
            background: rgba(239, 68, 68, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #f87171;
        }

        .result-icon {
            font-size: 32px;
            margin-bottom: 8px;
        }

        /* Numpad */
        .numpad {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-top: 24px;
            max-width: 280px;
            margin-left: auto;
            margin-right: auto;
        }

        .numpad-btn {
            height: 56px;
            background: rgba(255,255,255,0.07);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 14px;
            color: #e0e8f0;
            font-size: 22px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s ease;
            -webkit-tap-highlight-color: transparent;
        }

        .numpad-btn:active {
            background: rgba(0, 180, 216, 0.2);
            border-color: #00b4d8;
            transform: scale(0.95);
        }

        .numpad-btn.clear {
            font-size: 14px;
            color: #f87171;
        }

        .numpad-btn.backspace {
            font-size: 20px;
            color: #fbbf24;
        }

        /* Spinner */
        .spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,0.3);
            border-top: 3px solid #fff;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            vertical-align: middle;
            margin-right: 8px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Footer */
        .footer {
            margin-top: 28px;
            font-size: 11px;
            color: #4a5568;
        }

        /* Box ID display */
        .box-info {
            font-size: 13px;
            color: #7a8ba8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🔐</div>
        <h1>LAUNDRY LOCKER</h1>
        <p class="subtitle">Hệ thống tủ giặt thông minh</p>

        <div class="status-bar">
            <span class="status-dot"></span>
            <span>Box #<span id="boxId">1</span> — Sẵn sàng</span>
        </div>

        <p class="pin-label">Nhập mã PIN 6 số để mở khóa</p>

        <div class="pin-container" id="pinContainer">
            <input type="text" class="pin-input" maxlength="1" inputmode="none" readonly>
            <input type="text" class="pin-input" maxlength="1" inputmode="none" readonly>
            <input type="text" class="pin-input" maxlength="1" inputmode="none" readonly>
            <input type="text" class="pin-input" maxlength="1" inputmode="none" readonly>
            <input type="text" class="pin-input" maxlength="1" inputmode="none" readonly>
            <input type="text" class="pin-input" maxlength="1" inputmode="none" readonly>
        </div>

        <button class="btn-unlock" id="btnUnlock" disabled onclick="handleUnlock()">
            MỞ KHÓA
        </button>

        <div class="result" id="result"></div>

        <div class="numpad" id="numpad">
            <button class="numpad-btn" onclick="pressKey('1')">1</button>
            <button class="numpad-btn" onclick="pressKey('2')">2</button>
            <button class="numpad-btn" onclick="pressKey('3')">3</button>
            <button class="numpad-btn" onclick="pressKey('4')">4</button>
            <button class="numpad-btn" onclick="pressKey('5')">5</button>
            <button class="numpad-btn" onclick="pressKey('6')">6</button>
            <button class="numpad-btn" onclick="pressKey('7')">7</button>
            <button class="numpad-btn" onclick="pressKey('8')">8</button>
            <button class="numpad-btn" onclick="pressKey('9')">9</button>
            <button class="numpad-btn clear" onclick="clearAll()">XÓA</button>
            <button class="numpad-btn" onclick="pressKey('0')">0</button>
            <button class="numpad-btn backspace" onclick="backspace()">⌫</button>
        </div>

        <p class="footer">ESP8266 Locker Controller v1.0</p>
    </div>

    <script>
        const inputs = document.querySelectorAll('.pin-input');
        const btnUnlock = document.getElementById('btnUnlock');
        const resultDiv = document.getElementById('result');
        let currentIndex = 0;

        function pressKey(num) {
            if (currentIndex >= 6) return;
            inputs[currentIndex].value = num;
            inputs[currentIndex].classList.add('filled');
            currentIndex++;

            if (currentIndex < 6) {
                inputs[currentIndex].focus();
            }

            btnUnlock.disabled = currentIndex < 6;
        }

        function backspace() {
            if (currentIndex <= 0) return;
            currentIndex--;
            inputs[currentIndex].value = '';
            inputs[currentIndex].classList.remove('filled', 'error', 'success');
            btnUnlock.disabled = true;
        }

        function clearAll() {
            inputs.forEach(inp => {
                inp.value = '';
                inp.classList.remove('filled', 'error', 'success');
            });
            currentIndex = 0;
            btnUnlock.disabled = true;
            hideResult();
        }

        function getPin() {
            return Array.from(inputs).map(i => i.value).join('');
        }

        function showResult(type, icon, message) {
            resultDiv.className = 'result ' + type;
            resultDiv.innerHTML = '<div class="result-icon">' + icon + '</div>' + message;
        }

        function hideResult() {
            resultDiv.className = 'result';
            resultDiv.innerHTML = '';
        }

        async function handleUnlock() {
            const pin = getPin();
            if (pin.length !== 6) return;

            // Show loading
            btnUnlock.innerHTML = '<span class="spinner"></span> Đang xác thực...';
            btnUnlock.classList.add('loading');
            btnUnlock.disabled = true;
            hideResult();

            try {
                const response = await fetch('/verify-and-unlock', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pinCode: pin })
                });

                const data = await response.json();

                if (data.success) {
                    inputs.forEach(i => i.classList.add('success'));
                    showResult('success', '✅', data.message || 'Đã mở khóa thành công!');

                    // Auto-reset after 8 seconds
                    setTimeout(() => {
                        clearAll();
                    }, 8000);
                } else {
                    inputs.forEach(i => i.classList.add('error'));
                    showResult('error', '❌', data.message || 'Mã PIN không hợp lệ');

                    // Auto-clear after 3 seconds
                    setTimeout(() => {
                        clearAll();
                    }, 3000);
                }
            } catch (err) {
                inputs.forEach(i => i.classList.add('error'));
                showResult('error', '⚠️', 'Lỗi kết nối. Vui lòng thử lại.');
                setTimeout(() => clearAll(), 3000);
            }

            btnUnlock.innerHTML = 'MỞ KHÓA';
            btnUnlock.classList.remove('loading');
        }
    </script>
</body>
</html>
)rawliteral";

#endif // WEB_UI_H
