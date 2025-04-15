<template>
  <div class="container">
    <h1>MEETYOO Video Player</h1>
    <VideoPlayer />
  </div>
</template>

<script setup lang="ts">
import VideoPlayer from './components/VideoPlayer.vue'
</script>

<style lang="scss" scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  
  h1 {
    text-align: center;
    margin-bottom: 30px;
    color: var(--secondary, #002D5C);
    font-weight: 600;
  }
}
</style>