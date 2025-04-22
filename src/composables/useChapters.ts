import { ref } from 'vue';

export interface Chapter {
  id: string;
  title: string;
  startTime: number;
}

export default function useChapters() {
  // Use the proxied URL that will be handled by Vite's dev server
  const dashUrl = '/api/live/S14JJ9Z6PKoO/bf1d4883-5305-4d65-a299-cbb654ef1ed9/full.xml';
  
  const chapters = ref<Chapter[]>([]);
  const currentChapter = ref<Chapter | null>(null);
  const showChapterMenu = ref(false);
  
  // Fetch chapters from DASH file
  async function fetchChapters() {
    try {
      const response = await fetch(dashUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chapters: ${response.status} ${response.statusText}`);
      }
      
      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      
      // Find the EventStream element with chapters
      const eventStream = xmlDoc.querySelector('EventStream[schemeIdUri="urn:mpeg:dash:event:2012"][value="chapters"]');
      
      if (!eventStream) {
        console.error('No chapters found in DASH file');
        return useMockChapters(); // Fallback to mock if no chapters found
      }
      
      // Extract events/chapters
      const events = eventStream.querySelectorAll('Event');
      const parsedChapters: Chapter[] = Array.from(events).map((event, index) => {
        const id = event.getAttribute('id') || `chapter-${index}`;
        
        // Get presentationTime as a number (might be in milliseconds)
        let presentationTime = Number(event.getAttribute('presentationTime') || 0);
        
        // If the time seems to be in milliseconds (over 1000), convert to seconds
        if (presentationTime > 1000) {
          presentationTime = presentationTime / 1000;
        }
        
        // Extract title from content data
        const contentData = event.textContent?.trim() || `Chapter ${index + 1}`;
        
        return {
          id,
          title: contentData,
          startTime: presentationTime
        };
      });
      
      // Sort chapters by start time
      parsedChapters.sort((a, b) => a.startTime - b.startTime);
      
      if (parsedChapters.length === 0) {
        return useMockChapters(); // Fallback to mock if no chapters parsed
      }
      
      chapters.value = parsedChapters;
    } catch (error) {
      console.error('Error fetching chapters:', error);
      // Fallback to mock chapters in case of error
      useMockChapters();
    }
  }
  
  // Use mock chapters as a fallback
  function useMockChapters() {
    chapters.value = [
      { id: 'chapter-1', title: 'Introduction', startTime: 0 },
      { id: 'chapter-2', title: 'Overview', startTime: 15 },
      { id: 'chapter-3', title: 'First Topic', startTime: 30 },
      { id: 'chapter-4', title: 'Second Topic', startTime: 45 },
      { id: 'chapter-5', title: 'Third Topic', startTime: 60 },
      { id: 'chapter-6', title: 'Summary', startTime: 75 },
      { id: 'chapter-7', title: 'Conclusion', startTime: 90 }
    ];
    console.log('Using mock chapters:', chapters.value);
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