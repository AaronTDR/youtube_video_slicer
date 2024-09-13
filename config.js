export const config = {
  ffmpeg_exe_path: "ffmpeg",
  ffprobe_exe_path: "ffprobe",
  workingFolderPath: "C:/users/aaron/downloads/result/",
  segmentsFolderPath: "C:/users/aaron/downloads/result/segments/",
  url: "https://www.youtube.com/watch?v=pDOHwsFkaFE",
  timestamps: [
    { start: "00:00:00", end: "00:00:03" },
    { start: "00:00:07", end: "00:00:10" },
    { start: "00:00:11", end: "00:00:14" },
  ],
  concurrencyLimit: 2,
  shortsConfig: {
    shortThumbnailPath: "C:/users/aaron/downloads/result/short_1.png",
    generateThumbnail: true,
  },
  isYoutubeShort: true,
};
