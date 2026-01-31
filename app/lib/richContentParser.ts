/**
 * Rich Content Parser
 * 
 * Parses plain text content and identifies rich media patterns:
 * - Markdown links: [text](url)
 * - Image URLs: .png, .jpg, .jpeg, .webp, .gif
 * - YouTube URLs: youtube.com/watch, youtu.be
 * - Vimeo URLs: vimeo.com
 * 
 * Returns structured tokens for rendering.
 */

export type ContentToken =
  | { type: 'text'; content: string }
  | { type: 'link'; text: string; url: string }
  | { type: 'image'; url: string }
  | { type: 'video'; platform: 'youtube' | 'vimeo'; videoId: string; url: string };

/**
 * Parse content and return structured tokens
 */
export function parseRichContent(content: string): ContentToken[] {
  const tokens: ContentToken[] = [];
  let remaining = content;
  let position = 0;

  while (remaining.length > 0) {
    // Try to match markdown link: [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      const text = linkMatch[1];
      const url = linkMatch[2];
      tokens.push({ type: 'link', text, url });
      remaining = remaining.slice(linkMatch[0].length);
      position += linkMatch[0].length;
      continue;
    }

    // Try to match standalone URL (for images and videos)
    const urlMatch = remaining.match(/^(https?:\/\/[^\s)]+)/);
    if (urlMatch) {
      const url = urlMatch[1];
      
      // Check if it's an image (including URLs with paths that end in image extensions)
      if (/\.(png|jpg|jpeg|webp|gif)($|\?|\/)/i.test(url) || url.includes('picsum.photos') || url.includes('placeholder.com')) {
        tokens.push({ type: 'image', url });
        remaining = remaining.slice(urlMatch[0].length);
        position += urlMatch[0].length;
        continue;
      }

      // Check if it's a YouTube video
      const youtubeId = extractYouTubeId(url);
      if (youtubeId) {
        tokens.push({ type: 'video', platform: 'youtube', videoId: youtubeId, url });
        remaining = remaining.slice(urlMatch[0].length);
        position += urlMatch[0].length;
        continue;
      }

      // Check if it's a Vimeo video
      const vimeoId = extractVimeoId(url);
      if (vimeoId) {
        tokens.push({ type: 'video', platform: 'vimeo', videoId: vimeoId, url });
        remaining = remaining.slice(urlMatch[0].length);
        position += urlMatch[0].length;
        continue;
      }

      // Regular URL - treat as link
      tokens.push({ type: 'link', text: url, url });
      remaining = remaining.slice(urlMatch[0].length);
      position += urlMatch[0].length;
      continue;
    }

    // No match - consume one character as text
    const char = remaining[0];
    if (tokens.length > 0 && tokens[tokens.length - 1].type === 'text') {
      // Append to previous text token
      (tokens[tokens.length - 1] as { type: 'text'; content: string }).content += char;
    } else {
      tokens.push({ type: 'text', content: char });
    }
    remaining = remaining.slice(1);
    position += 1;
  }

  return tokens;
}

/**
 * Extract YouTube video ID from URL
 */
function extractYouTubeId(url: string): string | null {
  // youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return watchMatch[1];

  // youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return shortMatch[1];

  return null;
}

/**
 * Extract Vimeo video ID from URL
 */
function extractVimeoId(url: string): string | null {
  // vimeo.com/VIDEO_ID
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}
