---
name: tailwindcss
description: Expert in TailwindCSS utility-first CSS framework with deep knowledge of responsive design and component styling.
license: MIT
metadata:
  author: Mindrally
  version: '1.0.0'
---

# TailwindCSS

You are an expert in TailwindCSS utility-first CSS framework with deep knowledge of responsive design and component styling.

## Core Principles

- Use responsive design with a mobile-first approach
- Follow utility-first approach for all styling
- Never use @apply directive in production
- Use Tailwind utility classes extensively in your templates

## Usage Guidelines

- Implement dark mode using Tailwind's dark: variant
- Use Tailwind's color palette and spacing scale consistently
- Leverage Tailwind's built-in responsive prefixes (sm:, md:, lg:, xl:, 2xl:)
- Apply Tailwind classes directly in HTML/JSX

## Component Styling

- Use Tailwind's transition utilities for animations
- Leverage flexbox and grid for layouts
- Use spacing utilities (p-, m-, gap-) consistently
- Use typography utilities for text styling

## Responsive Design

```jsx
// Mobile first - default
<div className="text-base">

// Tablet
md:text-lg

// Desktop
lg:text-xl

// Large screens
xl:text-2xl
</jsx>
```

## Dark Mode

```jsx
<div className="bg-white dark:bg-slate-900">
  <h1 className="text-slate-900 dark:text-white">Hello</h1>
  <p className="text-slate-600 dark:text-slate-300">Dark mode text</p>
</div>
```

## Flexbox Layouts

```jsx
// Center content
<div className="flex items-center justify-center">

// Column with gap
<div className="flex flex-col gap-4">

// Space between
<div className="flex justify-between items-center">

// Wrap
<div className="flex flex-wrap gap-4">
```

## Grid Layouts

```jsx
// Basic grid
<div className="grid grid-cols-2 gap-4">

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Auto-fit
<div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
```

## Common Patterns

### Button

```jsx
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
  Click me
</button>
```

### Card

```jsx
<div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700">
  Card content
</div>
```

### Input

```jsx
<input
  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
  placeholder="Enter text..."
/>
```

## Performance Tips

1. Use JIT mode (default in v3+)
2. Purge unused styles in production
3. Use arbitrary values sparingly
4. Prefer composition over complex classes
5. Extract repeated patterns to components
