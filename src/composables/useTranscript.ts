import { ref } from 'vue';

export interface Caption {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

export default function useTranscript() {
  // Use the proxied URL that will be handled by Vite's dev server
  const transcriptUrl = '/api/live/S14JJ9Z6PKoO/bf1d4883-5305-4d65-a299-cbb654ef1ed9/transcript.vtt';
  
  const captions = ref<Caption[]>([]);
  const currentCaption = ref<Caption | null>(null);
  const showCaptions = ref(true);
  
  // Parse VTT time format (00:00:00.000) to seconds
  function parseVttTime(timeString: string): number {
    const parts = timeString.split(':');
    let seconds = 0;
    
    if (parts.length === 3) {
      // Format: HH:MM:SS.mmm
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const secondsAndMs = parts[2].split('.');
      const secs = parseInt(secondsAndMs[0], 10);
      const ms = secondsAndMs.length > 1 ? parseInt(secondsAndMs[1], 10) / 1000 : 0;
      
      seconds = hours * 3600 + minutes * 60 + secs + ms;
    } else if (parts.length === 2) {
      // Format: MM:SS.mmm
      const minutes = parseInt(parts[0], 10);
      const secondsAndMs = parts[1].split('.');
      const secs = parseInt(secondsAndMs[0], 10);
      const ms = secondsAndMs.length > 1 ? parseInt(secondsAndMs[1], 10) / 1000 : 0;
      
      seconds = minutes * 60 + secs + ms;
    }
    
    return seconds;
  }
  
  // Fetch and parse WebVTT file
  async function fetchTranscript() {
    try {
      const response = await fetch(transcriptUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch transcript: ${response.status} ${response.statusText}`);
      }
      
      const text = await response.text();
      const parsedCaptions = parseVtt(text);
      
      if (parsedCaptions.length > 0) {
        captions.value = parsedCaptions;
      } else {
        console.error('No captions found in VTT file');
      }
    } catch (error) {
      console.error('Error fetching transcript:', error);
    }
  }
  
  // Parse WebVTT content
  function parseVtt(vttContent: string): Caption[] {
    const parsedCaptions: Caption[] = [];
    
    // Split content by lines and remove WebVTT header line
    const lines = vttContent.trim().split('\n');
    let lineIndex = 0;
    
    // Skip header (first line with "WEBVTT")
    if (lines[0].includes('WEBVTT')) {
      lineIndex = 1;
    }
    
    while (lineIndex < lines.length) {
      // Skip empty lines
      if (lines[lineIndex].trim() === '') {
        lineIndex++;
        continue;
      }
      
      // Check if the line contains a cue identifier (could be a number or other text)
      let id = `caption-${parsedCaptions.length + 1}`;
      if (!lines[lineIndex].includes('-->')) {
        id = lines[lineIndex].trim();
        lineIndex++;
      }
      
      // Parse timestamp line (format: 00:00:00.000 --> 00:00:00.000)
      const timestampLine = lines[lineIndex].trim();
      lineIndex++;
      
      if (!timestampLine.includes('-->')) {
        continue; // Invalid format, skip
      }
      
      const [startTimeStr, endTimeStr] = timestampLine.split('-->').map(t => t.trim());
      const startTime = parseVttTime(startTimeStr);
      const endTime = parseVttTime(endTimeStr);
      
      // Collect caption text (could span multiple lines)
      let text = '';
      while (lineIndex < lines.length && lines[lineIndex].trim() !== '') {
        text += (text ? '\n' : '') + lines[lineIndex];
        lineIndex++;
      }
      
      // Add caption
      if (text) {
        parsedCaptions.push({
          id,
          startTime,
          endTime,
          text
        });
      }
    }
    
    return parsedCaptions;
  }
  
  // Update current caption based on video time
  function updateCurrentCaption(currentTime: number) {
    if (!captions.value.length) return;
    
    // Find caption that matches current time
    const found = captions.value.find(
      caption => currentTime >= caption.startTime && currentTime <= caption.endTime
    );
    
    currentCaption.value = found || null;
  }
  
  // Toggle captions visibility
  function toggleCaptions() {
    showCaptions.value = !showCaptions.value;
  }
  
  return {
    captions,
    currentCaption,
    showCaptions,
    fetchTranscript,
    updateCurrentCaption,
    toggleCaptions
  };
}