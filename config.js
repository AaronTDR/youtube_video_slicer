export const config = {
  ffmpeg_exe_path: "ffmpeg",
  ffprobe_exe_path: "ffprobe",
  workingFolderPath: "C:/users/aaron/downloads/result/",
  segmentsFolderPath: "C:/users/aaron/downloads/result/segments/",
  url: "https://www.youtube.com/watch?v=aIxqms8KSkA",
  timestamps: [
    { start: "00:00:00.860", end: "00:00:03.293" },
    { start: "00:00:07.126", end: "00:00:09.726" },
    { start: "00:00:12.426", end: "00:00:13.728" },
  ],
  concurrencyLimit: 2,
  shortsConfig: {
    shortThumbnailPath: "C:/users/aaron/downloads/result/short_1.png",
    generateThumbnail: false,
  },
  isYoutubeShort: false,
};
