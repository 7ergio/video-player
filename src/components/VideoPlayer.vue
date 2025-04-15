<template>
  <div class="video-container">
    <video 
      ref="videoRef" 
      class="video-player"
      controls
      preload="metadata"
    >
      <source 
        :src="videoUrl" 
        type="video/webm"
      >
      Your browser does not support the video tag.
    </video>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const videoUrl = 'https://meetyoo-code-challenge.s3.eu-central-1.amazonaws.com/live/S14JJ9Z6PKoO/bf1d4883-5305-4d65-a299-cbb654ef1ed9/video.webm';
const videoRef = ref<HTMLVideoElement | null>(null);

// Can use it later on to do something when the video is loaded
onMounted(() => {
  if (videoRef.value) {
    console.log('Video element is mounted');
  }
});
</script>

<style scoped>
.video-container {
  width: 100%;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-player {
  width: 100%;
  height: auto;
  display: block;
}
</style>