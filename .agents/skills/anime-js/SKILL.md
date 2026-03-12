---
name: anime-js
description: Anime.js Animation Guidelines for creating performant web animations.
license: MIT
metadata:
  author: Mindrally
  version: '1.0.0'
---

# Anime.js Animation Guidelines

You are an expert in Anime.js, JavaScript, and web animation performance. Follow these guidelines when creating animations.

## Core Principles

### Installation and Import

```bash
npm install animejs
```

```javascript
// Full import
import anime from 'animejs';

// Modular import for smaller bundle size
import { animate, timeline, stagger } from 'animejs';
```

### Basic Animation

```javascript
anime({
  targets: '.element',
  translateX: 250,
  rotate: '1turn',
  duration: 800,
  easing: 'easeInOutQuad',
});
```

## Performance Optimization

### Frame Rate Control

```javascript
// Adjust global frame rate for lower-end devices
anime.suspendWhenDocumentHidden = true;

// Control FPS for specific animations
anime({
  targets: '.element',
  translateX: 250,
  update: function (anim) {
    // Custom frame rate limiting if needed
  },
});
```

### Use Transforms Over Layout Properties

```javascript
// Good - uses GPU-accelerated transforms
anime({
  targets: '.element',
  translateX: 100,
  translateY: 100,
  scale: 1.5,
  rotate: '45deg',
});

// Avoid - causes layout repaints
anime({
  targets: '.element',
  width: 200,
  height: 200,
  marginLeft: 50, // Avoid
});
```

## Common Animations

### Fade In

```javascript
anime({
  targets: '.element',
  opacity: [0, 1],
  translateY: [20, 0],
  duration: 600,
  easing: 'easeOutExpo',
});
```

### Staggered List Animation

```javascript
anime({
  targets: '.list-item',
  opacity: [0, 1],
  translateX: [-50, 0],
  delay: anime.stagger(100), // 100ms delay between each
  duration: 500,
});
```

### Hover Effect

```javascript
const hoverAnimation = anime({
  targets: '.card',
  scale: 1.05,
  duration: 200,
  easing: 'easeOutQuad',
});

// Play on hover
document.querySelector('.card').addEventListener('mouseenter', () => hoverAnimation.play());
document.querySelector('.card').addEventListener('mouseleave', () => hoverAnimation.reverse());
```

### Timeline

```javascript
const tl = anime.timeline({
  easing: 'easeOutExpo',
  duration: 1000,
});

tl.add({
  targets: '.header',
  opacity: [0, 1],
  translateY: [-20, 0],
})
  .add(
    {
      targets: '.content',
      opacity: [0, 1],
      translateY: [20, 0],
    },
    '-=500',
  ) // Overlap by 500ms
  .add(
    {
      targets: '.button',
      scale: [0, 1],
    },
    '-=500',
  );
```

## Easing Options

| Easing        | Description                  |
| ------------- | ---------------------------- |
| linear        | No easing                    |
| easeInQuad    | Accelerates                  |
| easeOutQuad   | Decelerates                  |
| easeInOutQuad | Accelerates then decelerates |
| spring        | Bouncy effect                |

## Accessibility

```javascript
// Respect reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  anime({
    targets: '.element',
    opacity: [0, 1],
    duration: 500,
  });
}
```

## Best Practices

1. Use transforms (translate, scale, rotate) for GPU acceleration
2. Avoid animating layout properties (width, height, margin)
3. Use timelines for complex sequences
4. Implement stagger for list animations
5. Consider reduced-motion preferences
6. Use appropriate easing for the effect
7. Clean up animations on component unmount
