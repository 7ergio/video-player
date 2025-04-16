<template>
  <div class="video-container">
    <!-- Video element without native controls -->
    <video 
      ref="videoRef" 
      class="video-player"
      preload="metadata"
      @click="togglePlay"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @play="isPlaying = true"
      @pause="isPlaying = false"
    >
      <source 
        :src="videoUrl" 
        type="video/webm"
      >
      Your browser does not support the video tag.
    </video>
    
    <!-- Play button overlay when paused -->
    <div 
      v-if="!isPlaying" 
      class="play-overlay"
      @click="togglePlay"
    >
      <div class="play-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 3L19 12L5 21V3Z" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
    
    <!-- Custom controls -->
    <div class="video-controls">
      <!-- Progress bar -->
      <div class="progress-bar" @click="seek">
        <div class="progress" :style="{ width: `${progress}%` }"></div>
      </div>
      
      <div class="controls-container">
        <!-- Play/Pause button -->
        <button class="control-button" @click="togglePlay">
          <svg v-if="isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 4H6V20H10V4Z" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18 4H14V20H18V4Z" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 3L19 12L5 21V3Z" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        
        <!-- Time display -->
        <div class="time-display">
          <span>{{ formatTime(currentTime) }}</span>
          <span class="time-separator">/</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
        
        <!-- Volume control -->
        <div class="volume-control">
          <button class="control-button" @click="toggleMute">
            <svg v-if="isMuted || volume == 0" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              v-model="volume"
              @input="updateVolume"
            >
          </div>
          
          <span class="volume-percentage">{{ Math.round(volume * 100) }}%</span>
        </div>
        
        <!-- Fullscreen button -->
        <button class="control-button" @click="toggleFullscreen">
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const videoUrl = 'https://meetyoo-code-challenge.s3.eu-central-1.amazonaws.com/live/S14JJ9Z6PKoO/bf1d4883-5305-4d65-a299-cbb654ef1ed9/video.webm';
const videoRef = ref<HTMLVideoElement | null>(null);

// Video state
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const progress = ref(0);
const volume = ref(1);
const previousVolume = ref(1); // Store previous volume level
const isMuted = ref(false);
const isFullscreen = ref(false);

// Computed properties
const volumePercentage = computed(() => {
  return volume.value * 100;
});

// Event handlers
function onTimeUpdate() {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime;
    progress.value = (currentTime.value / duration.value) * 100;
  }
}

function onLoadedMetadata() {
  if (videoRef.value) {
    duration.value = videoRef.value.duration;
  }
}

function togglePlay() {
  if (videoRef.value) {
    if (isPlaying.value) {
      videoRef.value.pause();
    } else {
      videoRef.value.play();
    }
  }
}

function seek(event: MouseEvent) {
  if (videoRef.value) {
    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = event.clientX - rect.left;
    const percentage = (clickPosition / rect.width) * 100;
    
    // Ensure percentage is between 0 and 100
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    
    // Calculate the time based on percentage of duration
    const newTime = (clampedPercentage / 100) * duration.value;
    
    // Set the video's current time
    videoRef.value.currentTime = newTime;
  }
}

function updateVolume() {
  if (videoRef.value) {
    videoRef.value.volume = volume.value;
    
    // When the volume is not 0, save it as the previous volume
    if (volume.value > 0) {
      previousVolume.value = volume.value;
    }
    
    // Set muted state when volume is set to 0
    if (volume.value == 0) {
      isMuted.value = true;
      videoRef.value.muted = true;
    } else if (isMuted.value) {
      // Unmute if volume is changed to > 0 and was previously muted
      isMuted.value = false;
      videoRef.value.muted = false;
    }
  }
}

function toggleMute() {
  if (videoRef.value) {
    // If currently muted
    if (isMuted.value) {
      // Unmute and restore previous volume
      isMuted.value = false;
      videoRef.value.muted = false;
      
      // Restore to previous volume, or 100% if previous was 0
      volume.value = previousVolume.value > 0 ? previousVolume.value : 1;
      videoRef.value.volume = volume.value;
    } else {
      // Save current volume before muting
      previousVolume.value = volume.value;
      
      // Mute the video
      isMuted.value = true;
      videoRef.value.muted = true;
      
      // Visually show 0% on the slider
      volume.value = 0;
      videoRef.value.volume = 0;
    }
  }
}

function toggleFullscreen() {
  if (videoRef.value) {
    if (!document.fullscreenElement) {
      videoRef.value.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
}

// Handle fullscreen changes
function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
  
  // When exiting fullscreen, update volume and mute states from the video element
  if (!isFullscreen.value && videoRef.value) {
    // Update mute state
    isMuted.value = videoRef.value.muted;
    
    // If muted, set volume display to 0 while preserving previousVolume
    if (isMuted.value) {
      volume.value = 0;
    } else {
      volume.value = videoRef.value.volume;
      // If volume > 0, update previous volume
      if (volume.value > 0) {
        previousVolume.value = volume.value;
      }
    }
  }
}

// Format time in MM:SS format
function formatTime(timeInSeconds: number): string {
  if (isNaN(timeInSeconds)) return '0:00';
  
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Add keyboard event handler for accessibility reasons
function handleKeydown(event: KeyboardEvent) {
  if (!videoRef.value) return;
  
  switch (event.key) {
    case ' ': // Space
    case 'k': // YouTube-style shortcuts
      togglePlay();
      event.preventDefault();
      break;
    case 'ArrowUp':
      // Increase volume by 10%
      volume.value = Math.min(1, volume.value + 0.1);
      updateVolume();
      event.preventDefault();
      break;
    case 'ArrowDown':
      // Decrease volume by 10%
      volume.value = Math.max(0, volume.value - 0.1);
      updateVolume();
      event.preventDefault();
      break;
    case 'm':
      // Toggle mute
      toggleMute();
      event.preventDefault();
      break;
    case 'f':
      // Toggle fullscreen
      toggleFullscreen();
      event.preventDefault();
      break;
  }
}

function onVolumeChange() {
  if (videoRef.value) {
    // Update our state from the video element
    volume.value = videoRef.value.volume;
    isMuted.value = videoRef.value.muted;
    
    // If volume > 0, update previous volume
    if (volume.value > 0) {
      previousVolume.value = volume.value;
    }
  }
}

onMounted(() => {
  if (videoRef.value) {
    console.log('Video element is mounted');
    
    // Add keyboard event listener
    window.addEventListener('keydown', handleKeydown);
    
    // Add fullscreen change listener
    document.addEventListener('fullscreenchange', onFullscreenChange);
    
    // Add volume change listener
    videoRef.value.addEventListener('volumechange', onVolumeChange);
  }
});

onUnmounted(() => {
  // Remove keyboard event listener when component is destroyed
  window.removeEventListener('keydown', handleKeydown);
  
  // Remove fullscreen change listener
  document.removeEventListener('fullscreenchange', onFullscreenChange);
  
  // Remove volume change listener
  if (videoRef.value) {
    videoRef.value.removeEventListener('volumechange', onVolumeChange);
  }
});
</script>

<style lang="scss" scoped>
.video-container {
  width: 100%;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  aspect-ratio: 16 / 9;
  
  &:hover {
    .video-controls {
      opacity: 1;
    }
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
    
    svg {
      width: 30px;
      height: 30px;
    }
    
    &:hover {
      transform: scale(1.1);
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
  
  .progress-bar {
    width: 100%;
    height: 5px;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 2.5px;
    margin-bottom: 10px;
    cursor: pointer;
    position: relative;
    
    .progress {
      height: 100%;
      background-color: var(--primary, #0064FF);
      border-radius: 2.5px;
    }
  }
  
  .controls-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: white;
    
    .control-button {
      background: none;
      border: none;
      padding: 5px;
      cursor: pointer;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:hover {
        opacity: 0.8;
      }
    }
    
    .time-display {
      font-family: monospace;
      font-size: 14px;
      
      .time-separator {
        margin: 0 3px;
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
      }
      
      .volume-percentage {
        min-width: 40px;
        font-size: 12px;
        margin-left: 5px;
        font-family: monospace;
        
        @media (max-width: 768px) {
          display: none;
        }
      }
    }
  }
}
</style>