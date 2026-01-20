# Scroll-Synchronized Frame Animation

## 🎯 Concept

Tất cả 241 frames hoạt động như **một vật thể 3D duy nhất** di chuyển liên tục theo scroll position. Không có auto-play, không có delay - frames phản ứng trực tiếp và tức thì với mọi chuyển động scroll của user.

## 🔄 Cơ chế hoạt động

### Global Scroll Flow

```
User scrolls page
    ↓
Hero section (Frames 1-70)
    ├─ Scroll 0% → Frame 1
    ├─ Scroll 50% → Frame 35
    └─ Scroll 100% → Frame 70
    ↓
Section 1: Locker Nhỏ (Frames 71-90)
    ├─ Enter viewport → Start from Frame 71
    ├─ Center → Frame 80
    └─ Exit viewport → Frame 90
    ↓
Section 2: Locker Lớn (Frames 91-165)
    ├─ Enter viewport → Start from Frame 91
    ├─ Progress through → Frames 91-165
    └─ Exit viewport → Frame 165
    ↓
Section 3: Locker Premium (Frames 166-241)
    ├─ Enter viewport → Start from Frame 166
    ├─ Progress through → Frames 166-241
    └─ Exit viewport → Frame 241
```

### Scroll Mapping

#### Hero Section

```typescript
// Scroll position → Frame mapping
scrollProgress = scrollYProgress * 1.2  // Slightly accelerated
frameNumber = 1 + Math.floor(scrollProgress * 70)

Example:
- User at top (0%) → Frame 1
- User scrolls 25% → Frame 18
- User scrolls 50% → Frame 35
- User scrolls 100% → Frame 70
```

#### Feature Sections

```typescript
// Section visibility: 0 = above viewport, 1 = below viewport
// Active range: 0.15 - 0.85 (section centered in viewport)

normalizedProgress = (scrollYProgress - 0.15) / 0.7
frameNumber = startFrame + Math.floor(normalizedProgress * frameCount)

Example (Locker Nhỏ: Frames 71-90):
- Section enters view (15%) → Frame 71
- Section centered (50%) → Frame 80
- Section exits view (85%) → Frame 90
```

## 🎨 Visual Feedback

### Frame Counter

Hiển thị ở góc trên phải của mỗi animation:

```
Frame 45/70
Frame 125/165
```

**Purpose**: Cho user biết vị trí hiện tại trong sequence

### Scroll Hint (Hero only)

Hiển thị ở hero section khi mới load:

```
Cuộn để khám phá
       ↓
```

**Auto-hide**: Ẩn đi khi user bắt đầu scroll (progress > 5%)

## 🎭 Animation Properties

### Opacity Transitions

```typescript
opacity: [0, 1, 1, 0]; // at [0%, 20%, 80%, 100%] of section
```

- **0-20%**: Fade in khi section vào viewport
- **20-80%**: Full opacity - section active
- **80-100%**: Fade out khi section rời viewport

### Scale Transitions

```typescript
scale: [0.95, 1, 1, 0.95]; // at [0%, 20%, 80%, 100%]
```

- Slight scale effect tạo cảm giác depth
- Scale up khi vào, scale down khi ra

### Horizontal Slide (X)

```typescript
// Normal sections
x: [-30, 0, 30]; // at [0%, 50%, 100%]

// Reversed sections
x: [30, 0, -30]; // at [0%, 50%, 100%]
```

- Tạo parallax effect
- Xen kẽ trái/phải giữa các sections

## 📊 Scroll Ranges

### Tổng quan phân bổ

```
Total: 241 frames across full page scroll

Hero (Top):        1-70   (70 frames)  29%
Section 1 (Small): 71-90  (20 frames)  8%
Section 2 (Large): 91-165 (75 frames)  31%
Section 3 (Prem.): 166-241 (76 frames) 32%
```

### Viewport Mapping

```
Hero Section:
├─ Covers: 0-100vh scroll
└─ Maps to: Frames 1-70

Feature Sections (each):
├─ Trigger: Section enters viewport at bottom
├─ Active: Section at 15%-85% of viewport height
├─ Complete: Section exits viewport at top
└─ Maps to: Respective frame range
```

## 🚀 Performance Characteristics

### Advantages

✅ **Instant Response**: No delay, frames change immediately with scroll
✅ **User Control**: Complete control over animation speed via scroll
✅ **Predictable**: Same behavior every time
✅ **Smooth**: 60fps synchronized with scroll events
✅ **Reversible**: Scroll up to go backwards in frames

### Technical Implementation

```typescript
// useScroll hook tracks scroll position
const { scrollYProgress } = useScroll({
  target: sectionRef,
  offset: ["start end", "end start"],
});

// Real-time update on every scroll
useEffect(() => {
  const unsubscribe = scrollYProgress.on("change", (latest) => {
    const normalized = (latest - 0.15) / 0.7;
    setScrollProgress(normalized);
  });
  return () => unsubscribe();
}, [scrollYProgress]);

// Canvas updates immediately
useEffect(() => {
  const frameIndex = Math.floor(scrollProgress * images.length);
  const img = images[frameIndex];
  context.drawImage(img, 0, 0, canvas.width, canvas.height);
}, [scrollProgress, images]);
```

## 🎮 User Experience

### Scroll Behaviors

**Slow Scroll**: Xem từng frame chi tiết, như xem slow-motion
**Fast Scroll**: Frames chuyển nhanh, tạo cảm giác animation mượt
**Scroll Up**: Quay lại frames trước, có thể review
**Scroll Down**: Tiến về phía trước trong story

### Story Flow

1. **Hero**: Giới thiệu tổng quan hệ thống locker (70 frames)
   - User scroll qua toàn bộ giới thiệu
   - Mỗi pixel scroll = progress trong introduction

2. **Section 1**: Chi tiết locker nhỏ (20 frames)
   - Nhanh, súc tích
   - 3-4 lần scroll wheel để hoàn thành

3. **Section 2**: Chi tiết locker lớn (75 frames)
   - Nhiều detail hơn
   - 8-10 lần scroll wheel

4. **Section 3**: Chi tiết locker premium (76 frames)
   - Full feature showcase
   - 8-10 lần scroll wheel

## 🛠️ Customization

### Điều chỉnh scroll sensitivity

```typescript
// Hero section - faster scroll mapping
scrollProgress = scrollYProgress * 1.5; // Change multiplier
// 1.0 = normal, 1.5 = faster, 0.8 = slower

// Feature sections - active range
normalizedProgress = (scrollYProgress - 0.15) / 0.7;
//                                      ↑ start    ↑ width
// Wider range = slower progression
// Narrower range = faster progression
```

### Thay đổi opacity timing

```typescript
const opacity = useTransform(
  scrollYProgress,
  [0, 0.2, 0.8, 1], // ← Adjust these
  [0, 1, 1, 0],
);

// Example: Faster fade in/out
[0, 0.1, 0.9, 1]; // Fade in/out in 10% instead of 20%
```

### Disable animations (frames only)

```typescript
// Remove all motion transforms
const opacity = 1; // Always visible
const scale = 1; // No scaling
const x = 0; // No sliding
```

## 🐛 Debugging

### Check scroll values

```typescript
// Add console logs
useEffect(() => {
  const unsubscribe = scrollYProgress.on("change", (latest) => {
    console.log("Scroll:", latest, "Frame:", currentFrame);
  });
}, [scrollYProgress]);
```

### Verify frame loading

```typescript
// In FrameSequence component
console.log("Loaded frames:", images.length);
console.log("Current frame:", frameIndex);
```

### Test scroll ranges

```typescript
// Log when section is in different states
if (scrollYProgress < 0.15) console.log("Section above viewport");
if (scrollYProgress >= 0.15 && scrollYProgress <= 0.85)
  console.log("Section active");
if (scrollYProgress > 0.85) console.log("Section below viewport");
```

## 📱 Mobile Considerations

### Touch Scroll

- Works naturally with touch scrolling
- Smooth finger tracking
- Inertia scrolling supported

### Performance

- Canvas rendering optimized for mobile
- requestAnimationFrame sync
- Memory efficient (preloaded images)

### UX Adjustments

```typescript
// Detect mobile
const isMobile = window.innerWidth < 768;

// Faster progression on mobile (less scrolling)
const multiplier = isMobile ? 1.5 : 1.2;
scrollProgress = scrollYProgress * multiplier;
```

## 🎯 Best Practices

1. **Smooth Scroll**: Enable smooth scrolling for better UX
2. **Frame Quality**: Balance quality vs file size
3. **Loading State**: Show skeleton while frames load
4. **Error Handling**: Graceful degradation for missing frames
5. **Performance**: Monitor FPS, optimize if needed

## 📈 Comparison: Auto-play vs Scroll-Sync

| Feature        | Auto-play | Scroll-Sync    |
| -------------- | --------- | -------------- |
| Control        | Limited   | Full           |
| Speed          | Fixed     | Variable       |
| Repeat         | Manual    | Automatic      |
| Predictable    | Timed     | Position-based |
| Interruption   | Can skip  | Seamless       |
| Learning Curve | None      | Intuitive      |
| Best For       | Demos     | Interactive    |

## 🌟 Key Advantages

1. **Intuitive**: Scroll = natural interaction
2. **Explorable**: User can go back/forward freely
3. **Engaging**: Active participation vs passive watching
4. **Flexible**: Control speed by scroll speed
5. **Accessible**: Works with all scroll methods
6. **Performant**: No timers, just position tracking

---

**Mode**: Scroll-Synchronized  
**Version**: 3.0  
**Updated**: 2026-01-19
