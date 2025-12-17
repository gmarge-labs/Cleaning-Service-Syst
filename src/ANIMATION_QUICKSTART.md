# 🚀 Animation Quick Start - SparkleVille

## 30-Second Guide

### 1️⃣ For Content Above the Fold (Visible Immediately)
```tsx
import { motion } from 'motion/react';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  {children}
</motion.div>
```

### 2️⃣ For Content Below the Fold (Scroll to Reveal)
```tsx
import { ScrollReveal } from '../components/ui/scroll-reveal';

<ScrollReveal variant="fade-up">
  {children}
</ScrollReveal>
```

### 3️⃣ For Multiple Items (Stagger Effect)
```tsx
import { ScrollRevealStagger, ScrollRevealItem } from '../components/ui/scroll-reveal';

<ScrollRevealStagger staggerDelay={0.1}>
  {items.map((item, i) => (
    <ScrollRevealItem key={i} variant="scale">
      <Card {...item} />
    </ScrollRevealItem>
  ))}
</ScrollRevealStagger>
```

### 4️⃣ For Simple Hover Effects (CSS Only)
```tsx
<div className="card-hover hover-3d">
  {children}
</div>
```

---

## Available Variants

### ScrollReveal Variants
- `fade-up` - Fade in from bottom
- `fade-down` - Fade in from top
- `fade-left` - Fade in from left
- `fade-right` - Fade in from right
- `scale` - Scale up from 80%
- `zoom` - Zoom in from 50%
- `flip` - 3D flip effect

---

## CSS Animation Classes

### One-Time Animations
```html
<div className="animate-fade-in">
<div className="animate-slide-in-bottom">
<div className="animate-slide-in-left">
<div className="animate-slide-in-right">
<div className="animate-scale-in">
```

### Infinite Animations
```html
<div className="animate-float">
<div className="animate-pulse-soft">
<div className="animate-gradient">
```

### Stagger Delays
```html
<div className="animate-fade-in stagger-1"> <!-- 0.05s delay -->
<div className="animate-fade-in stagger-2"> <!-- 0.1s delay -->
<div className="animate-fade-in stagger-3"> <!-- 0.15s delay -->
```

### Hover Effects
```html
<div className="hover-3d">         <!-- 3D lift on hover -->
<div className="card-hover">       <!-- Shadow + lift -->
<div className="glow-primary">     <!-- Pink glow -->
<div className="glow-accent">      <!-- Rose glow -->
```

---

## Common Patterns

### Pattern 1: Hero Section
```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
  <h1>Welcome</h1>
  <button className="animate-pulse-soft">CTA</button>
</motion.div>
```

### Pattern 2: Feature Cards Grid
```tsx
<ScrollRevealStagger staggerDelay={0.15} className="grid md:grid-cols-3 gap-6">
  {features.map((feature, i) => (
    <ScrollRevealItem key={i} variant="scale">
      <div className="card-hover hover-3d p-6">
        <Icon className="animate-float" />
        <h3>{feature.title}</h3>
      </div>
    </ScrollRevealItem>
  ))}
</ScrollRevealStagger>
```

### Pattern 3: Section Header
```tsx
<ScrollReveal variant="fade-up" className="text-center mb-12">
  <h2>Section Title</h2>
  <p>Section description</p>
</ScrollReveal>
```

### Pattern 4: Button with Effects
```tsx
<button className="glow-primary hover-3d transition-all duration-300 hover:scale-105">
  Click Me
</button>
```

---

## Props Reference

### ScrollReveal
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | string | 'fade-up' | Animation type |
| delay | number | 0 | Delay in seconds |
| duration | number | 0.6 | Animation duration |
| once | boolean | true | Animate only once |
| amount | number | 0.2 | Viewport % to trigger |

### ScrollRevealStagger
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| staggerDelay | number | 0.1 | Delay between children |
| once | boolean | true | Animate only once |

---

## Decision Tree

```
Start
  ├─ Is content visible on page load?
  │   ├─ YES → Use motion with initial/animate
  │   └─ NO  → Use ScrollReveal
  │
  ├─ Multiple items that should animate sequentially?
  │   ├─ YES → Use ScrollRevealStagger + ScrollRevealItem
  │   └─ NO  → Use single ScrollReveal or motion
  │
  ├─ Need hover effect only?
  │   ├─ YES → Use CSS classes (hover-3d, card-hover, etc.)
  │   └─ NO  → Combine with other animations
  │
  └─ Need continuous animation?
      ├─ YES → Use CSS infinite (animate-float, animate-pulse-soft)
      └─ NO  → Use one-time animation
```

---

## Testing

### Quick Test
1. Open any page
2. Scroll slowly down
3. Elements should animate into view

### Full Test
1. Navigate to `/test-animations.html`
2. Verify all 8 CSS animations work
3. Click "Replay" to restart

### Browser Console
Check for errors:
- No "motion/react not found"
- No keyframe warnings

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Animations not showing | Hard refresh (Ctrl+Shift+R) |
| ScrollReveal not triggering | Use motion for above-fold content |
| Import error | Use `motion/react` not `framer-motion` |
| Hover not working | Add `transition-all duration-300` |

---

## Color Variables

```css
--primary-500: rgb(26 34 56)     /* Navy Blue */
--secondary-500: rgb(255 20 147) /* Deep Pink */
--accent-500: rgb(255 105 180)   /* Rose Pink */
```

---

## 📚 Full Documentation
- **Complete Guide**: `/ANIMATION_GUIDE.md`
- **Status Report**: `/ANIMATION_STATUS.md`
- **Test Page**: `/test-animations.html`

---

**Last Updated**: December 2024
