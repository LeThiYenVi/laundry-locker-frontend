# Landing Page - Auto-Play Frame Animation Guide

## 🎬 Tổng quan

Landing page sử dụng 241 frame images với hiệu ứng **auto-play video-like** - mỗi section tự động phát như một video ngắn khi vào viewport, sau đó người dùng có thể scroll để kiểm soát.

## 📦 Phân chia Frames theo Loại Locker

### Hero Section - Giới thiệu Tổng quan (Frames 1-70)

```
📍 Vị trí: Hero section đầu trang
🎞️ Frames: 001-070 (70 frames)
⏱️ Auto-play: 5 giây
📝 Nội dung: Giới thiệu tổng quan về hệ thống locker
```

**Đặc điểm:**

- Tự động phát ngay khi trang load
- Có thanh progress bar hiển thị %
- User có thể scroll để bỏ qua

---

### Section 1 - Locker Nhỏ (Frames 71-90)

```
📦 Loại: Locker Nhỏ (Compact)
🎞️ Frames: 071-090 (20 frames)
⏱️ Auto-play: 3 giây
🎯 Use case: Đồ cá nhân, phụ kiện, quần áo nhẹ
```

**Tính năng:**

- ✅ Kích thước nhỏ gọn, tối ưu
- ✅ Phù hợp đồ cá nhân, phụ kiện
- ✅ Khóa điện tử thông minh
- ✅ Giá cả hợp lý, tiết kiệm

---

### Section 2 - Locker Lớn (Frames 91-165)

```
📦 Loại: Locker Lớn (Spacious)
🎞️ Frames: 091-165 (75 frames)
⏱️ Auto-play: 4 giây
🎯 Use case: Bộ đồ đầy đủ, đồ thể thao
```

**Tính năng:**

- ✅ Không gian lưu trữ rộng rãi
- ✅ Phù hợp bộ đồ đầy đủ
- ✅ Tổ chức khoa học, ngăn nắp
- ✅ Thông gió tốt, chống ẩm mốc

---

### Section 3 - Locker Premium (Frames 166-241)

```
📦 Loại: Locker Premium (High-end)
🎞️ Frames: 166-241 (76 frames)
⏱️ Auto-play: 5 giây
🎯 Use case: Đồ cao cấp, bảo quản đặc biệt
```

**Tính năng:**

- ⭐ Hệ thống sấy khô tích hợp
- ⭐ Công nghệ khử mùi, diệt khuẩn
- ⭐ Bảo quản đồ cao cấp
- ⭐ Điều khiển nhiệt độ, độ ẩm

---

## 🎮 Cơ chế Auto-Play

### Flow Diagram

```
User lands on page
    ↓
Hero auto-plays (5s)
    ↓
User scrolls down
    ↓
Section enters viewport (20% visible)
    ↓
Auto-play starts (3-5s based on frame count)
    ↓
Animation completes OR user scrolls
    ↓
hasPlayed flag = true
    ↓
Section responds to scroll only
```

### Timing Logic

```typescript
// Tính toán thời gian dựa trên số frames
const frameCount = frameEnd - frameStart + 1;
const duration =
  frameCount <= 20
    ? 3000 // Locker nhỏ: 3s
    : frameCount <= 75
      ? 4000 // Locker lớn: 4s
      : 5000; // Premium: 5s
```

### Viewport Detection

```typescript
// Section được coi là "in view" khi:
isInView = scrollProgress > 0.2 && scrollProgress < 0.8;
// Tức là section ở giữa viewport (20%-80%)
```

## 🎨 User Experience Design

### Progressive Disclosure

1. **Hero**: Giới thiệu tổng quan → Tạo ấn tượng
2. **Section 1**: Locker nhỏ → Entry-level, dễ tiếp cận
3. **Section 2**: Locker lớn → Mid-tier, phổ biến
4. **Section 3**: Premium → High-end, đầy đủ tính năng

### Visual Feedback

- 🟦 **Progress indicator**: "Đang phát... X%"
- 🔵 **Animated pulse dot**: Feedback trực quan
- 🎯 **Auto-hide**: Ẩn sau khi hoàn thành

### Control Options

1. **Auto**: Tự động phát khi vào view
2. **Scroll**: User scroll để override
3. **One-time**: Chỉ auto-play 1 lần per section

## 🚀 Performance Optimizations

### Frame Loading

```typescript
// Vite glob import with eager loading
const frameModules = import.meta.glob("../../assets/ezgif-frame-*.jpg", {
  eager: true,
});
```

### Animation Loop

```typescript
// requestAnimationFrame for 60fps
const animate = () => {
  if (isInView && !hasPlayed) {
    const progress = elapsed / duration;
    setAutoPlayProgress(progress);
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
};
```

### Memory Management

- ✅ Cancel animation on unmount
- ✅ Use ref for flags (avoid re-renders)
- ✅ Canvas reuse (single canvas per section)
- ✅ Image caching via glob import

## 🛠️ Customization Guide

### Thay đổi thời gian auto-play

```typescript
// File: ScrollSection.tsx
// Tìm dòng này và điều chỉnh:
const duration =
  frameCount <= 20
    ? 3000 // <- Đổi 3000
    : frameCount <= 75
      ? 4000 // <- Đổi 4000
      : 5000; // <- Đổi 5000
```

### Thay đổi viewport trigger

```typescript
// File: ScrollSection.tsx
setIsInView(latest > 0.2 && latest < 0.8);
//                    ↑ Start      ↑ End
// 0.2 = Bắt đầu khi section ở 20% viewport
// 0.8 = Kết thúc khi section ở 80% viewport
```

### Disable auto-play (chỉ dùng scroll)

```typescript
// Option 1: Set duration = 0
const duration = 0;

// Option 2: Set hasPlayed = true ngay từ đầu
const hasPlayedRef = useRef(true);
```

### Cho phép replay

```typescript
// Xóa hoặc comment dòng này:
hasPlayedRef.current = true; // <- Xóa dòng này
```

## 🐛 Troubleshooting

### Auto-play không chạy

**Triệu chứng:** Section không tự động phát
**Kiểm tra:**

1. Console log `isInView` state
2. Verify `hasPlayedRef.current === false`
3. Check `duration` calculation
4. Ensure `requestAnimationFrame` được gọi

### Animation giật lag

**Triệu chứng:** Frames nhảy cóc, không smooth
**Giải pháp:**

- ✅ Giảm frame count per section
- ✅ Compress images (giảm kích thước)
- ✅ Use WebP format thay JPG
- ✅ Check CPU usage

### Progress bar không ẩn

**Triệu chứng:** Progress vẫn hiện sau khi xong
**Kiểm tra:**

1. `hasPlayedRef.current` có được set true?
2. Conditional rendering logic đúng chưa?
3. Console log `autoPlayProgress` value

### Frames load chậm

**Triệu chứng:** Loading indicator hiện lâu
**Giải pháp:**

- ✅ Optimize image size
- ✅ Use progressive JPEG
- ✅ Check network tab (DevTools)
- ✅ Consider lazy loading sections

## 📱 Mobile Optimization

### Touch Gestures

- ✅ Scroll to control (works naturally)
- ✅ Auto-play on mobile (tested)
- ✅ Responsive canvas sizing

### Performance Tips

```typescript
// Reduce frames on mobile if needed
const isMobile = window.innerWidth < 768;
const mobileFrameStep = 2; // Skip every other frame

if (isMobile) {
  // Load frames with step
  for (let i = startFrame; i <= endFrame; i += mobileFrameStep) {
    // ...
  }
}
```

## 🎯 Best Practices

1. **Consistent Timing**: Giữ timing predictable cho UX tốt
2. **Visual Feedback**: Luôn show progress cho auto-play
3. **User Control**: Cho phép override bằng scroll
4. **One-time Play**: Tránh annoy user với replay
5. **Smooth Transitions**: Ensure frames liên tục
6. **Mobile First**: Test trên mobile devices
7. **Accessibility**: Provide motion preference settings

## 📊 Analytics Ideas

Track để optimize:

- Auto-play completion rate
- Scroll override rate (how often users skip)
- Section view time
- Frame sequence completion
- Device-specific performance

## 🌐 Browser Support

| Browser | Auto-play | Canvas | Performance |
| ------- | --------- | ------ | ----------- |
| Chrome  | ✅        | ✅     | Excellent   |
| Firefox | ✅        | ✅     | Excellent   |
| Safari  | ✅        | ✅     | Good        |
| Edge    | ✅        | ✅     | Excellent   |
| Mobile  | ✅        | ✅     | Good        |
| IE11    | ❌        | ⚠️     | Not tested  |

---

**Phiên bản:** 2.0 (Auto-play)  
**Cập nhật:** 2026-01-19
