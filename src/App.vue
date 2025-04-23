<template>
  <div class="app-container">
    <header class="header">
      <div class="logo-container">
        <img src="/logo.svg" alt="Meetyoo Logo" class="logo" />
      </div>
      <h1>Coding Challenge Video Player</h1>
    </header>
    
    <main class="main-content">
      <VideoPlayer />
    </main>
    
    <footer class="footer">
      <p>Developed by <a href="https://serhii-cv.netlify.app/" target="_blank" rel="noopener noreferrer">Serhii Bilous</a></p>
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
  display: flex;
  flex-direction: column;
  align-items: center;
  
  h1 {
    color: var(--secondary);
    margin-top: 0.5rem;
  }
  
  .logo-container {
    max-width: 200px;
    margin-bottom: 0.5rem;
    
    .logo {
      width: 100%;
      height: auto;
    }
  }
  
  @media (max-width: 767px) {
    padding: 1rem;
    
    h1 {
      font-size: 1.5rem;
    }
    
    .logo-container {
      max-width: 150px;
    }
  }
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  
  @media (max-width: 767px) {
    padding: 1rem;
  }
}

.footer {
  padding: 1rem;
  text-align: center;
  background-color: var(--secondary);
  color: white;
  
  a {
    color: white;
    text-decoration: underline;
    transition: opacity 0.2s ease;
    
    &:hover, &:focus {
      opacity: 0.8;
    }
  }
}
</style>