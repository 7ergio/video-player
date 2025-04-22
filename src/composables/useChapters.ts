import { ref } from 'vue';

export interface Chapter {
  id: string;
  title: string;
  startTime: number;
}

export default function useChapters() {
  const chapters = ref<Chapter[]>([]);
  const currentChapter = ref<Chapter | null>(null);
  const showChapterMenu = ref(false);
  
  // Fetch chapters - in development, we'll just use mock data
  async function fetchChapters() {
    try {
      // In a real production environment, you would fetch from the actual DASH file
      chapters.value = [
        { id: 'chapter-1', title: 'Introduction', startTime: 0 },
        { id: 'chapter-2', title: 'Overview', startTime: 15 },
        { id: 'chapter-3', title: 'First Topic', startTime: 30 },
        { id: 'chapter-4', title: 'Second Topic', startTime: 45 },
        { id: 'chapter-5', title: 'Third Topic', startTime: 60 },
        { id: 'chapter-6', title: 'Summary', startTime: 75 },
        { id: 'chapter-7', title: 'Conclusion', startTime: 90 }
      ];
    } catch (error) {
      console.error('Error setting up chapters:', error);
    }
  }
  
  // Update current chapter based on video time
  function updateCurrentChapter(currentTime: number) {
    if (!chapters.value.length) return;
    
    // Find the chapter that corresponds to the current time
    // We need to find the last chapter that starts before the current time
    let foundChapter: Chapter | null = null;
    
    for (let i = 0; i < chapters.value.length; i++) {
      const chapter = chapters.value[i];
      if (chapter.startTime <= currentTime) {
        foundChapter = chapter;
      } else {
        // Since chapters are sorted, once we find a chapter that starts after current time, we can stop
        break;
      }
    }
    
    currentChapter.value = foundChapter;
  }
  
  // Calculate chapter position for display on progress bar
  function getChapterPosition(chapter: Chapter, duration: number): number {
    if (!duration) return 0;
    return (chapter.startTime / duration) * 100;
  }
  
  // Toggle chapter menu visibility
  function toggleChapterMenu() {
    showChapterMenu.value = !showChapterMenu.value;
  }
  
  return {
    chapters,
    currentChapter,
    showChapterMenu,
    fetchChapters,
    updateCurrentChapter,
    getChapterPosition,
    toggleChapterMenu
  };
}