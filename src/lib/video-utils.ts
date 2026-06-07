export type VideoProvider = "YOUTUBE" | "FACEBOOK";

export type ParsedVideo = {
  provider: VideoProvider;
  originalUrl: string;
  embedUrl: string;
  thumbnail: string | null;
  videoId: string | null;
};

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function extractFacebookVideoId(url: string): string | null {
  const patterns = [
    /facebook\.com\/.*\/videos\/(\d+)/,
    /fb\.watch\/([a-zA-Z0-9_-]+)/,
    /facebook\.com\/watch\/?\?v=(\d+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function parseVideoUrl(url: string): ParsedVideo | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const youtubeId = extractYouTubeId(trimmed);
  if (youtubeId) {
    return {
      provider: "YOUTUBE",
      originalUrl: trimmed,
      embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`,
      thumbnail: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
      videoId: youtubeId,
    };
  }

  if (trimmed.includes("facebook.com") || trimmed.includes("fb.watch")) {
    const fbId = extractFacebookVideoId(trimmed);
    const encoded = encodeURIComponent(trimmed);
    return {
      provider: "FACEBOOK",
      originalUrl: trimmed,
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=false&width=560`,
      thumbnail: null,
      videoId: fbId,
    };
  }

  return null;
}

export function isValidVideoUrl(url: string): boolean {
  return parseVideoUrl(url) !== null;
}
