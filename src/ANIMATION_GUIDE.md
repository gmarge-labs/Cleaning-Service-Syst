# SparkleVille Animation System Guide

## 🎨 Overview
SparkleVille uses a comprehensive animation system combining **CSS keyframe animations**, **Tailwind utility classes**, and **Motion (React)** for scroll-triggered effects.

---

## 📚 Table of Contents
1. [CSS Keyframe Animations](#css-keyframe-animations)
2. [Tailwind Animation Utilities](#tailwind-animation-utilities)
3. [Motion/React Components](#motionreact-components)
4. [Usage Examples](#usage-examples)
5. [Troubleshooting](#troubleshooting)

---

## 🎬 CSS Keyframe Animations

### Defined in `/styles/globals.css`

#### 1. **fadeIn**
Simple opacity transition from 0 to 1
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

#### 2. **slideInFromBottom**
Slides up from below with fade
```css
@keyframes slideInFromBottom {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

#### 3. **slideInLeft / slideInRight**
Horizontal slide animations
```css
@keyframes slideInLeft {
  from { transform: translateX(-30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
```

#### 4. **scaleIn**
Scale from 90% to 100% with fade
```css
@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

#### 5. **float**
Continuous floating motion (infinite)
```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

#### 6. **pulse**
Soft pulsing opacity (infinite)
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

#### 7. **gradientShift**
Animated gradient background (infinite)
```css
@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

#### 8. **shimmer**
Shimmer overlay effect
```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

---

## 🛠️ Tailwind Animation Utilities

### Defined in `/styles/globals.css` under `@layer utilities`

### One-time Animations
```html
<div class="animate-fade-in">Fades in</div>
<div class="animate-slide-in-bottom">Slides up from bottom</div>
<div class="animate-slide-in-left">Slides from left</div>
<div class="animate-slide-in-right">Slides from right</div>
<div class="animate-scale-in">Scales up</div>
```

### Infinite Animations
```html
<div class="animate-float">Floats continuously</div>
<div class="animate-pulse-soft">Pulses softly</div>
<div class="animate-gradient">Animated gradient (must have gradient background)</div>
```

### Stagger Delays
Use with animation classes to create sequential effects:
```html
<div class="animate-fade-in stagger-1">Item 1 (0.05s delay)</div>
<div class="animate-fade-in stagger-2">Item 2 (0.1s delay)</div>
<div class="animate-fade-in stagger-3">Item 3 (0.15s delay)</div>
<div class="animate-fade-in stagger-4">Item 4 (0.2s delay)</div>
<div class="animate-fade-in stagger-5">Item 5 (0.25s delay)</div>
<div class="animate-fade-in stagger-6">Item 6 (0.3s delay)</div>
```

### Hover Effects
```html
<div class="hover-3d">3D tilt on hover</div>
<div class="card-hover">Lift and shadow on hover</div>
```

### Glow Effects
```html
<button class="glow-primary">Glows pink on hover</button>
<button class="glow-accent">Glows rose on hover</button>
```

---

## ⚛️ Motion/React Components

### Located in `/components/ui/scroll-reveal.tsx`

### 1. ScrollReveal
Animates elements when they scroll into view

**Props:**
- `variant`: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'zoom' | 'flip'
- `delay`: number (in seconds, default: 0)
- `duration`: number (in seconds, default: 0.6)
- `once`: boolean (animate only once, default: true)
- `amount`: number (% of element visible to trigger, default: 0.2)

**Example:**
```tsx
import { ScrollReveal } from '../components/ui/scroll-reveal';

<ScrollReveal variant="fade-up" delay={0.2}>
  <h2>This animates when scrolled into view</h2>
</ScrollReveal>
```

### 2. ScrollRevealStagger
Container for staggered child animations

**Props:**
- `staggerDelay`: number (delay between children, default: 0.1)
- `once`: boolean (default: true)

**Example:**
```tsx
import { ScrollRevealStagger, ScrollRevealItem } from '../components/ui/scroll-reveal';

<ScrollRevealStagger staggerDelay={0.15}>
  <ScrollRevealItem variant="fade-up">Item 1</ScrollRevealItem>
  <ScrollRevealItem variant="fade-up">Item 2</ScrollRevealItem>
  <ScrollRevealItem variant="fade-up">Item 3</ScrollRevealItem>
</ScrollRevealStagger>
```

### 3. Motion (Direct Import)
For immediate animations (not scroll-triggered)

**Example:**
```tsx
import { motion } from 'motion/react';

<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.3 }}
>
  Animates immediately on mount
</motion.div>
```

---

## 📖 Usage Examples

### Example 1: Hero Section (Immediate Animation)
```tsx
import { motion } from 'motion/react';

<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
  <h1>Welcome to SparkleVille</h1>
  <button className="animate-pulse-soft">Book Now</button>
</motion.div>
```

### Example 2: Features Grid (Scroll-Triggered)
```tsx
import { ScrollRevealStagger, ScrollRevealItem } from '../components/ui/scroll-reveal';

<ScrollRevealStagger staggerDelay={0.1} className="grid md:grid-cols-3 gap-6">
  {features.map((feature, index) => (
    <ScrollRevealItem key={index} variant="scale">
      <div className="card-hover p-6">
        <h3>{feature.title}</h3>
        <p>{feature.description}</p>
      </div>
    </ScrollRevealItem>
  ))}
</ScrollRevealStagger>
```

### Example 3: Combining CSS & Motion
```tsx
import { ScrollReveal } from '../components/ui/scroll-reveal';

<ScrollReveal variant="fade-up">
  <div className="hover-3d glow-primary">
    <h2>Hover for 3D effect</h2>
  </div>
</ScrollReveal>
```

### Example 4: Card with Multiple Effects
```tsx
<div className="card-hover hover-3d animate-fade-in stagger-1">
  <div className="animate-float">
    <Icon className="w-12 h-12" />
  </div>
  <h3>Animated Card</h3>
</div>
```

---

## 🔧 Troubleshooting

### Animations Not Showing?

#### 1. **Check Browser Cache**
Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

#### 2. **Verify motion/react Import**
Make sure you're using `motion/react` not `framer-motion`:
```tsx
import { motion } from 'motion/react'; // ✅ Correct
import { motion } from 'framer-motion'; // ❌ Wrong
```

#### 3. **ScrollReveal Not Triggering?**
- Elements already in viewport won't animate (they're already "visible")
- Use direct `motion` for above-the-fold content
- Adjust `amount` prop for earlier/later triggering

#### 4. **CSS Animations Not Working?**
- Check if Tailwind is purging the classes (shouldn't happen with defined utilities)
- Verify the animation class is spelled correctly
- Check browser dev tools to see if the class is applied

#### 5. **Test Animations Separately**
Open `/test-animations.html` in your browser to verify CSS keyframes work

---

## 🎯 Best Practices

### 1. **Above-the-Fold Content**
Use immediate animations (motion) instead of scroll-triggered:
```tsx
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
  Hero Content
</motion.div>
```

### 2. **Below-the-Fold Content**
Use ScrollReveal for content that scrolls into view:
```tsx
<ScrollReveal variant="fade-up">
  Section Content
</ScrollReveal>
```

### 3. **Don't Overdo It**
- Use 1-2 animation types per section
- Keep durations between 0.3s - 0.8s
- Stagger delays should be 0.05s - 0.2s

### 4. **Performance**
- Use `once={true}` for ScrollReveal to prevent re-animation on scroll
- Avoid animating too many elements simultaneously
- Use CSS animations for simple effects, Motion for complex ones

### 5. **Accessibility**
- Respect `prefers-reduced-motion` (built into Motion)
- Keep animations smooth and not jarring
- Don't make critical content depend on animations

---

## 📝 Quick Reference

### Animation Decision Tree
```
Is content above the fold?
├─ YES → Use motion with initial/animate
└─ NO  → Use ScrollReveal

Need stagger effect?
├─ YES → Use ScrollRevealStagger + ScrollRevealItem
└─ NO  → Use single ScrollReveal or CSS class

Simple hover effect?
├─ YES → Use CSS utility classes (hover-3d, card-hover, glow-*)
└─ NO  → Use motion with whileHover

Continuous animation?
├─ YES → Use CSS infinite animations (animate-float, animate-pulse-soft)
└─ NO  → Use one-time CSS or motion animation
```

---

## 🎨 Color Theme Variables

For animated gradients and effects:

```css
/* Primary - Navy Blue */
--primary-500: rgb(26 34 56)

/* Secondary - Deep Pink */
--secondary-500: rgb(255 20 147)

/* Accent - Rose Pink */
--accent-500: rgb(255 105 180)
```

---

## 📦 Package Dependencies

- `motion/react` - React animation library (formerly Framer Motion)
- All CSS animations are native (no additional packages needed)

---

## 🚀 Testing Your Animations

1. **Open Test Page**: Navigate to `/test-animations.html`
2. **Check ScrollReveal**: Scroll through any page slowly
3. **Verify Hover Effects**: Hover over cards and buttons
4. **Test Responsiveness**: Check on mobile/tablet viewports
5. **Browser Console**: Check for any motion/react import errors

---

## ✅ Current Implementation Status

### ✅ Implemented
- [x] 8 CSS keyframe animations
- [x] Tailwind utility classes
- [x] ScrollReveal component
- [x] ScrollRevealStagger component
- [x] Header slide-in animation
- [x] Hero section immediate animations
- [x] All landing page sections (Features, Testimonials, etc.)
- [x] Services page
- [x] Pricing page
- [x] Contact page
- [x] Careers page
- [x] How It Works page

### 🎯 Pages with Animations
- HomePage (all sections)
- ServicesPage
- PricingPage
- HowItWorksPage
- ContactPage
- CareersPage
- Header (always visible)

---

**Last Updated**: December 2024
**Version**: 2.0
**Author**: SparkleVille Dev Team
