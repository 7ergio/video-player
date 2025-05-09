<template>
  <div class="video-container">
    <!-- Video element -->
    <video 
      ref="videoRef" 
      class="video-player"
      preload="metadata"
      @click="videoPlayer.togglePlay"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @play="onPlay"
      @pause="onPause"
      @volumechange="onVolumeChange"
      aria-label="Video player"
      tabindex="0"
    >
      <source :src="videoPlayer.videoUrl" type="video/webm">
      Your browser does not support the video tag.
    </video>
    
    <!-- Play button overlay -->
    <div 
      v-if="!videoPlayer.state.isPlaying" 
      class="play-overlay"
      @click="videoPlayer.togglePlay"
    >
      <div class="play-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 3L19 12L5 21V3Z" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
    
    <!-- Caption overlay inside video on desktop -->
    <div 
      v-if="transcriptManager.showCaptions.value && transcriptManager.currentCaption.value" 
      class="caption-overlay"
    >
      <div class="caption-text">
        {{ transcriptManager.currentCaption.value.text }}
      </div>
    </div>
    
    <!-- Video controls -->
    <div class="video-controls">
      <!-- Progress bar with chapter markers -->
      <div 
        class="progress-bar" 
        @click="videoPlayer.seek"
        role="slider"
        aria-label="Video progress"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="videoPlayer.state.progress"
        tabindex="0"
        @keydown="handleProgressKeydown"
      >
        <div class="progress" :style="{ width: `${videoPlayer.state.progress}%` }"></div>
        
        <!-- Chapter markers -->
        <div 
          v-for="chapter in chaptersList"
          :key="chapter.id"
          class="chapter-marker"
          :class="{ 'active': chapterManager.currentChapter.value?.id === chapter.id }"
          :style="{ left: `${chapterManager.getChapterPosition(chapter, videoPlayer.state.duration)}%` }"
          :title="chapter.title"
          @click.stop="seekToChapter(chapter)"
        ></div>
      </div>
      
      <div class="controls-container">
        <!-- Primary Controls Group (left side) -->
        <div class="controls-group">
          <!-- Play/Pause button -->
          <button 
            class="control-button" 
            @click="videoPlayer.togglePlay"
            aria-label="Play video"
            :aria-pressed="videoPlayer.state.isPlaying"
          >
            <svg v-if="videoPlayer.state.isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 4H6V20H10V4Z" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M18 4H14V20H18V4Z" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 3L19 12L5 21V3Z" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          
          <!-- Time display -->
          <div class="time-display" aria-live="polite">
            <span>{{ videoPlayer.formatTime(videoPlayer.state.currentTime) }}</span>
            <span class="time-separator">/</span>
            <span>{{ videoPlayer.formatTime(videoPlayer.state.duration) }}</span>
          </div>
          
          <!-- Current chapter label - Hidden on mobile -->
          <div v-if="chapterManager.currentChapter.value" class="current-chapter">
            <span>{{ chapterManager.currentChapter.value.title }}</span>
          </div>
        </div>
        
        <!-- Secondary Controls Group (right side) -->
        <div class="controls-group">
          <!-- Volume control -->
          <div class="volume-control">
            <button 
              class="control-button" 
              @click="videoPlayer.toggleMute"
              aria-label="Mute"
              :aria-pressed="videoPlayer.state.isMuted"
            >
              <svg v-if="videoPlayer.state.isMuted || videoPlayer.state.volume === 0" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M23 9L17 15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M17 9L23 15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 11.995C17.0039 13.3208 16.4774 14.5924 15.54 15.53" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            
            <div class="volume-slider-container">
              <div class="volume-slider-fill" :style="{ width: volumePercentage + '%' }"></div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                class="volume-slider"
                :value="videoPlayer.state.volume"
                @input="onVolumeInput"
                aria-label="Volume"
                :aria-valuemin="0"
                :aria-valuemax="1"
                :aria-valuenow="videoPlayer.state.volume"
              >
            </div>
            
            <span class="volume-percentage">{{ Math.round(videoPlayer.state.volume * 100) }}%</span>
          </div>
          
          <!-- Chapter menu button -->
          <button 
            class="control-button" 
            @click.stop="chapterManager.toggleChapterMenu"
            aria-label="Show chapters"
            aria-haspopup="true"
            :aria-expanded="chapterManager.showChapterMenu.value"
            :class="{ 'active': chapterManager.showChapterMenu.value }"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20M4 12H20M4 18H20" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          
          <!-- Caption toggle button -->
          <button 
            class="control-button" 
            @click="transcriptManager.toggleCaptions"
            aria-label="Toggle captions"
            :aria-pressed="transcriptManager.showCaptions.value"
            :class="{ 'active': transcriptManager.showCaptions.value }"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 4H5C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V6C21 4.89543 20.1046 4 19 4Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 9H12" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <path d="M7 13H17" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <path d="M14 9H17" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          
          <!-- Fullscreen button -->
          <button 
            class="control-button" 
            @click="videoPlayer.toggleFullscreen"
            aria-label="Toggle fullscreen"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3H2V9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 3H22V9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 21H2V15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 21H22V15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Chapter menu - Full screen on mobile -->
    <div 
      v-if="chapterManager.showChapterMenu.value" 
      class="chapter-menu"
      role="menu"
      aria-label="Chapters"
      @click.stop
    >
      <div class="chapter-menu-header">
        <h3>Chapters</h3>
        <button 
          class="close-button" 
          @click="chapterManager.toggleChapterMenu"
          aria-label="Close chapters menu"
        >×</button>
      </div>
      <div class="chapter-list">
        <div 
          v-for="chapter in chaptersList"
          :key="chapter.id"
          class="chapter-item"
          :class="{ 'active': chapterManager.currentChapter.value?.id === chapter.id }"
          @click="seekToChapter(chapter)"
          role="menuitem"
          tabindex="0"
          @keydown.enter="seekToChapter(chapter)"
          @keydown.space.prevent="seekToChapter(chapter)"
        >
          <span class="chapter-time">{{ videoPlayer.formatTime(chapter.startTime) }}</span>
          <span class="chapter-title">{{ chapter.title }}</span>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Mobile-only caption container (shown below video) -->
  <div v-if="transcriptManager.showCaptions.value && transcriptManager.currentCaption.value" class="mobile-caption-container">
    <div class="mobile-caption-text">
      {{ transcriptManager.currentCaption.value.text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import useVideoPlayer from '../composables/useVideoPlayer';
import useChapters from '../composables/useChapters';
import useTranscript from '../composables/useTranscript';
import type { Chapter } from '../composables/useChapters';

// Local ref for video element
const videoRef = ref<HTMLVideoElement | null>(null);

// Initialize the video player
const videoPlayer = useVideoPlayer('https://meetyoo-code-challenge.s3.eu-central-1.amazonaws.com/live/S14JJ9Z6PKoO/bf1d4883-5305-4d65-a299-cbb654ef1ed9/video.webm');

// Initialize the chapter manager
const chapterManager = useChapters();

// Initialize the transcript manager
const transcriptManager = useTranscript();

// Create a computed property to safely access the chapters array
const chaptersList = computed<Chapter[]>(() => {
  return Array.isArray(chapterManager.chapters.value) ? chapterManager.chapters.value : [];
});

// Computed property for volume percentage
const volumePercentage = computed(() => {
  return videoPlayer.state.volume * 100;
});

// Function to handle clicks outside the chapter menu
function setupOutsideClickListener() {
  const handleOutsideClick = (event: MouseEvent) => {
    if (chapterManager.showChapterMenu.value) {
      const chapterButton = document.querySelector('button[aria-haspopup="true"]');
      const isButtonClick = chapterButton && chapterButton.contains(event.target as Node);
      
      // Only close if it's not a click on the button that opened the menu
      if (!isButtonClick) {
        chapterManager.toggleChapterMenu();
      }
    }
  };

  // Add listener when component is mounted
  onMounted(() => {
    document.addEventListener('click', handleOutsideClick);
    
    // Clean up when component is unmounted
    onUnmounted(() => {
      document.removeEventListener('click', handleOutsideClick);
    });
  });
}

// Call the function to set up the listener
setupOutsideClickListener();

// Pass events to the video player
function onTimeUpdate() {
  if (videoRef.value) {
    videoPlayer.state.currentTime = videoRef.value.currentTime;
    videoPlayer.state.progress = (videoPlayer.state.currentTime / videoPlayer.state.duration) * 100;
    
    // Update current chapter
    chapterManager.updateCurrentChapter(videoPlayer.state.currentTime);
    
    // Update current caption
    transcriptManager.updateCurrentCaption(videoPlayer.state.currentTime);
  }
}

function onLoadedMetadata() {
  if (videoRef.value) {
    videoPlayer.state.duration = videoRef.value.duration;
  }
}

function onPlay() {
  videoPlayer.state.isPlaying = true;
}

function onPause() {
  videoPlayer.state.isPlaying = false;
}

function onVolumeChange() {
  if (videoRef.value) {
    videoPlayer.state.volume = videoRef.value.volume;
    videoPlayer.state.isMuted = videoRef.value.muted;
  }
}

// Handle volume slider input
function onVolumeInput(event: Event) {
  const target = event.target as HTMLInputElement;
  videoPlayer.updateVolume(parseFloat(target.value));
}

// Handle keyboard navigation for progress bar
function handleProgressKeydown(event: KeyboardEvent) {
  if (!videoRef.value) return;
  
  const duration = videoPlayer.state.duration;
  let currentTime = videoPlayer.state.currentTime;
  
  switch (event.key) {
    case 'ArrowRight':
      currentTime = Math.min(duration, currentTime + 5);
      videoRef.value.currentTime = currentTime;
      event.preventDefault();
      break;
    case 'ArrowLeft':
      currentTime = Math.max(0, currentTime - 5);
      videoRef.value.currentTime = currentTime;
      event.preventDefault();
      break;
  }
}

// Seek to specific chapter
function seekToChapter(chapter: Chapter) {
  if (videoRef.value) {
    videoRef.value.currentTime = chapter.startTime;
  }
}

// Set video ref and fetch chapters when component is mounted
onMounted(async () => {
  if (videoRef.value) {
    videoPlayer.videoRef.value = videoRef.value;
  }
  
  // Fetch chapters
  await chapterManager.fetchChapters();
  
  // Fetch transcript
  await transcriptManager.fetchTranscript();
});
</script>

<style lang="scss" scoped>
/* Base container - Mobile first approach */
.video-container {
  width: 100%;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  aspect-ratio: 16 / 9;
  
  /* If aspect-ratio is not supported, use a fallback */
  @supports not (aspect-ratio: 16 / 9) {
    &::before {
      content: "";
      display: block;
      padding-top: 56.25%; /* 16:9 aspect ratio */
    }
    
    .video-player {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }
  
  &:hover {
    .video-controls {
      opacity: 1;
    }
  }
  
  /* Always keep video container as a proper container */
  @media (max-width: 767px) {
    /* Keep overflow hidden for proper styling */
    overflow: hidden;
    border-radius: 8px;
  }
}

.video-player {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.3);
  cursor: pointer;
  
  .play-button {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
    
    /* Smaller play button on mobile */
    @media (max-width: 480px) {
      width: 48px;
      height: 48px;
      
      svg {
        width: 24px;
        height: 24px;
      }
    }
    
    svg {
      width: 30px;
      height: 30px;
    }
    
    &:hover {
      transform: scale(1.1);
    }
  }
}

/* Caption overlay inside video on desktop */
.caption-overlay {
  position: absolute;
  bottom: 70px;
  left: 0;
  width: 100%;
  text-align: center;
  z-index: 5;
  pointer-events: none; /* Allow click-through to video */
  
  .caption-text {
    display: inline-block;
    max-width: 80%;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 16px;
    text-align: center;
    user-select: none; /* Prevent selection */
  }
  
  /* Hide on mobile screens - we'll use the mobile-only container instead */
  @media (max-width: 767px) {
    display: none;
  }
}

/* Mobile-only caption container (shown below video) */
.mobile-caption-container {
  display: none; /* Hidden by default on desktop */
  
  /* Only show on mobile */
  @media (max-width: 767px) {
    display: block;
    width: 100%;
    margin-top: 10px;
    padding: 0;
    text-align: center;
    
    .mobile-caption-text {
      background-color: var(--secondary, #002D5C);
      width: 100%;
      border-radius: 4px;
      padding: 8px 0;
      font-size: 14px;
      color: white;
      text-align: center;
    }
  }
}

.video-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  /* Reduce size and make controls always visible on mobile */
  @media (max-width: 767px) {
    opacity: 1;
    padding: 6px;
    background: rgba(0, 0, 0, 0.7); /* More solid background */
  }
  
  .progress-bar {
    width: 100%;
    height: 5px;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 2.5px;
    margin-bottom: 10px;
    cursor: pointer;
    position: relative;
    
    /* Smaller progress bar on mobile */
    @media (max-width: 767px) {
      height: 4px;
      margin-bottom: 6px;
    }
    
    &:focus-visible {
      outline: 2px solid var(--primary, #0064FF);
      outline-offset: 2px;
    }
    
    .progress {
      height: 100%;
      background-color: var(--primary, #0064FF);
      border-radius: 2.5px;
    }
    
    .chapter-marker {
      position: absolute;
      top: 0;
      width: 4px;
      height: 100%;
      background-color: var(--accent, #00B5AD);
      transform: translateX(-50%);
      cursor: pointer;
      z-index: 2;
      transition: height 0.2s ease, background-color 0.2s ease;
      
      /* Smaller markers on mobile */
      @media (max-width: 767px) {
        width: 3px;
      }
      
      &.active {
        background-color: #FFFFFF;
      }
      
      &:hover {
        height: 10px;
        top: -2.5px;
      }
    }
  }
  
  .controls-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: white;
    width: 100%;
    
    /* Split controls into two groups for better mobile layout */
    .controls-group {
      display: flex;
      align-items: center;
      gap: 10px;
      
      @media (max-width: 360px) {
        gap: 4px;
      }
    }
    
    /* On very small screens, better organize the controls */
    @media (max-width: 360px) {
      flex-wrap: wrap;
      justify-content: center;
      
      /* Left group (play/pause, time) takes full width first */
      .controls-group:first-child {
        width: 100%;
        justify-content: space-between;
        margin-bottom: 4px;
      }
      
      /* Right group (volume, chapters, captions, fullscreen) centers below */
      .controls-group:last-child {
        justify-content: center;
      }
    }
    
    .control-button {
      background: none;
      border: none;
      padding: 5px;
      cursor: pointer;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      
      /* Smaller buttons on mobile */
      @media (max-width: 767px) {
        min-width: 32px;
        min-height: 32px;
        padding: 4px;
        
        svg {
          width: 18px;
          height: 18px;
        }
      }
      
      &:hover {
        opacity: 0.8;
      }
      
      &:focus-visible {
        outline: 2px solid var(--primary, #0064FF);
        outline-offset: 2px;
        border-radius: 4px;
      }
      
      /* Active state styling */
      &.active {
        color: var(--primary, #0064FF);
        
        svg path {
          stroke: var(--primary, #0064FF);
        }
      }
    }
    
    .time-display {
      font-family: monospace;
      font-size: 14px;
      
      .time-separator {
        margin: 0 3px;
      }
      
      @media (max-width: 480px) {
        font-size: 11px;
      }
    }
    
    .current-chapter {
      max-width: 200px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 14px;
      opacity: 0.9;
      
      @media (max-width: 767px) {
        display: none;
      }
    }
    
    .volume-control {
      display: flex;
      align-items: center;
      
      .volume-slider-container {
        position: relative;
        width: 60px;
        height: 4px;
        margin-left: 5px;
        
        @media (max-width: 480px) {
          display: none;
        }
      }
      
      .volume-slider-fill {
        position: absolute;
        height: 100%;
        background-color: white;
        border-radius: 2px;
        pointer-events: none;
        z-index: 1;
      }
      
      .volume-slider {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        -webkit-appearance: none;
        appearance: none;
        height: 4px;
        background: rgba(255, 255, 255, 0.3);
        outline: none;
        border-radius: 2px;
        margin: 0;
        z-index: 2;
        
        &::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          position: relative;
          z-index: 3;
        }
        
        &::-moz-range-thumb {
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          z-index: 3;
        }
        
        &:focus-visible {
          outline: 2px solid var(--primary, #0064FF);
        }
      }
      
      .volume-percentage {
        min-width: 40px;
        font-size: 12px;
        margin-left: 5px;
        font-family: monospace;
        
        @media (max-width: 767px) {
          display: none;
        }
      }
    }
  }
}

.chapter-menu {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 300px;
  max-height: 70%;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 10;
  
  /* On mobile, make it full screen */
  @media (max-width: 767px) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    max-height: 100%;
    border-radius: 0;
    background-color: rgba(0, 0, 0, 0.95);
    overflow-y: auto;
    z-index: 1000;
  }
  
  .chapter-menu-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    /* Larger header on mobile */
    @media (max-width: 767px) {
      padding: 15px 20px;
      
      h3 {
        font-size: 18px;
      }
    }
    
    h3 {
      margin: 0;
      color: white;
      font-size: 16px;
    }
    
    .close-button {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      
      /* Larger close button on mobile */
      @media (max-width: 767px) {
        font-size: 30px;
      }
      
      &:focus-visible {
        outline: 2px solid var(--primary, #0064FF);
        border-radius: 4px;
      }
    }
  }
  
  .chapter-list {
    max-height: calc(70vh - 40px);
    overflow-y: auto;
    
    /* Full height on mobile */
    @media (max-width: 767px) {
      max-height: calc(100vh - 60px);
    }
    
    .chapter-item {
      padding: 10px 15px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      cursor: pointer;
      transition: background-color 0.2s ease;
      
      /* Larger touch targets on mobile */
      @media (max-width: 767px) {
        padding: 15px 20px;
      }
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
      
      &.active {
        background-color: rgba(0, 100, 255, 0.3);
      }
      
      &:focus-visible {
        outline: 2px solid var(--primary, #0064FF);
        outline-offset: -2px;
      }
      
      .chapter-time {
        min-width: 50px;
        font-family: monospace;
        color: white;
        opacity: 0.7;
        margin-right: 10px;
      }
      
      .chapter-title {
        color: white;
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
  
  @media (max-width: 768px) {
    width: 250px;
  }
}
</style>