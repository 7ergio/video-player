import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';

export default function useVideoPlayer(videoUrl: string) {
  // References
  const videoRef = ref<HTMLVideoElement | null>(null);
  
  // State
  const state = reactive({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    progress: 0,
    volume: 1,
    previousVolume: 1,
    isMuted: false
  });
  
  // Computed properties
  const volumePercentage = computed(() => {
    return state.volume * 100;
  });
  
  // Time formatting
  function formatTime(timeInSeconds: number): string {
    if (isNaN(timeInSeconds)) return '0:00';
    
    // Convert to integer seconds
    const totalSeconds = Math.floor(timeInSeconds);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    } else {
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
  }
  
  // Video controls
  function togglePlay() {
    if (!videoRef.value) return;
    
    if (state.isPlaying) {
      videoRef.value.pause();
    } else {
      videoRef.value.play();
    }
  }
  
  function seek(event: MouseEvent) {
    if (!videoRef.value) return;
    
    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = event.clientX - rect.left;
    const percentage = (clickPosition / rect.width) * 100;
    
    // Ensure percentage is between 0 and 100
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    
    // Calculate the time based on percentage of duration
    const newTime = (clampedPercentage / 100) * state.duration;
    
    // Set the video's current time
    videoRef.value.currentTime = newTime;
  }
  
  function updateVolume(value: number) {
    if (!videoRef.value) return;
    
    state.volume = value;
    videoRef.value.volume = value;
    
    // When the volume is not 0, save it as the previous volume
    if (state.volume > 0) {
      state.previousVolume = state.volume;
    }
    
    // Set muted state when volume is set to 0
    if (state.volume === 0) {
      state.isMuted = true;
      videoRef.value.muted = true;
    } else if (state.isMuted) {
      // Unmute if volume is changed to > 0 and was previously muted
      state.isMuted = false;
      videoRef.value.muted = false;
    }
  }
  
  function toggleMute() {
    if (!videoRef.value) return;
    
    // If currently muted
    if (state.isMuted) {
      // Unmute and restore previous volume
      state.isMuted = false;
      videoRef.value.muted = false;
      
      // Restore to previous volume, or 100% if previous was 0
      state.volume = state.previousVolume > 0 ? state.previousVolume : 1;
      videoRef.value.volume = state.volume;
    } else {
      // Save current volume before muting
      state.previousVolume = state.volume;
      
      // Mute the video
      state.isMuted = true;
      videoRef.value.muted = true;
      
      // Visually show 0% on the slider
      state.volume = 0;
      videoRef.value.volume = 0;
    }
  }
  
  function toggleFullscreen() {
    if (!videoRef.value) return;
    
    if (!document.fullscreenElement) {
      videoRef.value.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
  
  // Keyboard controls
  function handleKeydown(event: KeyboardEvent) {
    if (!videoRef.value) return;
    
    switch (event.key) {
      case ' ': // Space
      case 'k': // YouTube-style shortcut
        togglePlay();
        event.preventDefault();
        break;
        
      case 'ArrowUp':
        // Increase volume by 10%
        updateVolume(Math.min(1, state.volume + 0.1));
        event.preventDefault();
        break;
        
      case 'ArrowDown':
        // Decrease volume by 10%
        updateVolume(Math.max(0, state.volume - 0.1));
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
  
  // Lifecycle hooks
  onMounted(() => {
    // Add keyboard controls
    window.addEventListener('keydown', handleKeydown);
  });
  
  onUnmounted(() => {
    // Remove keyboard controls
    window.removeEventListener('keydown', handleKeydown);
  });
  
  return {
    videoRef,
    videoUrl,
    state,
    volumePercentage,
    togglePlay,
    seek,
    updateVolume,
    toggleMute,
    toggleFullscreen,
    formatTime
  };
}