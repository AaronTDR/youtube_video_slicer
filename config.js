export const config = {
  ffmpeg_exe_path: "ffmpeg",
  ffprobe_exe_path: "ffprobe",
  workingFolderPath: "C:/users/aaron/downloads/result/",
  segmentsFolderPath: "C:/users/aaron/downloads/result/segments/",
  url: "https://www.youtube.com/watch?v=aIxqms8KSkA",
  timestamps: [
    { start: "00:00:00.000", end: "00:00:05.000" },
    { start: "00:00:07.010", end: "00:00:10.020" },
    { start: "00:00:11.000", end: "00:00:14.030" },
  ],
  concurrencyLimit: 2,
  shortsConfig: {
    shortThumbnailPath: "C:/users/aaron/downloads/result/short_1.png",
    generateThumbnail: false,
  },
  isYoutubeShort: false,
};
