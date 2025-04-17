<template>
  <div class="app-container">
    <header class="header">
      <h1>Meetyoo Video Player</h1>
    </header>
    
    <main class="main-content">
      <VideoPlayer />
    </main>
    
    <footer class="footer">
      <p>Built with Vue 3 + TypeScript</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import VideoPlayer from './components/VideoPlayer.vue'
</script>

<style lang="scss" scoped>
.app-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 1.5rem;
  text-align: center;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  h1 {
    color: var(--secondary);
  }
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

.footer {
  padding: 1rem;
  text-align: center;
  background-color: var(--secondary);
  color: white;
}
</style>