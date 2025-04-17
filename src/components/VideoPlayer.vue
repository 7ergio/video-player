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
    
    <!-- Video controls -->
    <div class="video-controls">
      <!-- Progress bar -->
      <div class="progress-bar" @click="videoPlayer.seek">
        <div class="progress" :style="{ width: `${videoPlayer.state.progress}%` }"></div>
      </div>
      
      <div class="controls-container">
        <!-- Play/Pause button -->
        <button class="control-button" @click="videoPlayer.togglePlay">
          <svg v-if="videoPlayer.state.isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 4H6V20H10V4Z" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18 4H14V20H18V4Z" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 3L19 12L5 21V3Z" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        
        <!-- Time display -->
        <div class="time-display">
          <span>{{ videoPlayer.formatTime(videoPlayer.state.currentTime) }}</span>
          <span class="time-separator">/</span>
          <span>{{ videoPlayer.formatTime(videoPlayer.state.duration) }}</span>
        </div>
        
        <!-- Volume control -->
        <div class="volume-control">
          <button class="control-button" @click="videoPlayer.toggleMute">
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
            <div class="volume-slider-fill" :style="{ width: videoPlayer.volumePercentage.value + '%' }"></div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              class="volume-slider"
              :value="videoPlayer.state.volume"
              @input="onVolumeInput"
            >
          </div>
          
          <span class="volume-percentage">{{ Math.round(videoPlayer.state.volume * 100) }}%</span>
        </div>
        
        <!-- Fullscreen button -->
        <button class="control-button" @click="videoPlayer.toggleFullscreen">
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
import { ref, onMounted } from 'vue';
import useVideoPlayer from '../composables/useVideoPlayer';

// Local ref for video element
const videoRef = ref<HTMLVideoElement | null>(null);

// Initialize the video player
const videoPlayer = useVideoPlayer('https://meetyoo-code-challenge.s3.eu-central-1.amazonaws.com/live/S14JJ9Z6PKoO/bf1d4883-5305-4d65-a299-cbb654ef1ed9/video.webm');

// Pass events to the video player
function onTimeUpdate() {
  if (videoRef.value) {
    videoPlayer.state.currentTime = videoRef.value.currentTime;
    videoPlayer.state.progress = (videoPlayer.state.currentTime / videoPlayer.state.duration) * 100;
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

// Set video ref when component is mounted
onMounted(() => {
  if (videoRef.value) {
    videoPlayer.videoRef.value = videoRef.value;
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