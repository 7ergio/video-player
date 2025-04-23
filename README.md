# Meetyoo Video Player

A modern, feature-rich video player built with Vue 3, TypeScript, and Vite. This project implements a custom video player with advanced features such as chapters navigation, captions, and responsive design.

## Features

### Tier 1: Basic Video Player
- Custom video player that plays webm video
- Responsive layout that adapts to different screen sizes
- Built with Vue 3 Composition API and TypeScript for maintainability

### Tier 2: Custom Control Bar
- Play/Pause button with appropriate icon changes
- Seek bar with progress indication
- Volume control with mute functionality
- Fullscreen button
- Time display (current time / total duration)
- Keyboard shortcuts (space/k for play/pause, m for mute, f for fullscreen, arrow keys for volume)

### Tier 3: Chapter Display
- Fetches chapter metadata from DASH file
- Displays chapter markers on the progress bar
- Shows current chapter name in the control bar
- Chapter menu for navigating between sections
- Visual indication of the active chapter

### Tier 4: Caption Visualization
- Parses WebVTT subtitle file
- Displays synchronized captions over the video
- Toggle button to enable/disable captions
- Captions displayed with semi-transparent background for better readability

## Installation

1. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Build for production
```bash
npm run build
```

## Usage

The video player can be integrated into any Vue application:

```vue
<template>
  <VideoPlayer />
</template>

<script setup>
import VideoPlayer from './components/VideoPlayer.vue';
</script>
```

## Accessibility

The video player implements several accessibility features to ensure it can be used by people with disabilities:

- ARIA attributes for screen reader compatibility
- Keyboard navigation support for all controls
- Focus management with visible focus indicators
- Proper semantic roles and labels
- Caption support for hearing-impaired users
- Color contrast that meets WCAG standards

## Responsive Design

The player is built with a mobile-first approach:

- Adapts to all screen sizes from mobile to desktop
- Optimized controls for touch devices
- Repositioned captions on mobile to avoid obscuring content
- Full-screen chapter menu on mobile for better usability
- Larger touch targets on smaller screens