export const config = {
  ffmpeg_exe_path: "ffmpeg",
  ffprobe_exe_path: "ffprobe",
  workingFolderPath: "C:/users/aaron/downloads/result/",
  segmentsFolderPath: "C:/users/aaron/downloads/result/segments/",
  url: "https://www.youtube.com/watch?v=amZPuZAkR0E",
  timestamps: [
    { start: "00:00:16", end: "00:00:19" },
    { start: "00:00:25", end: "00:00:31" },
    { start: "00:00:34", end: "00:00:38" },
    { start: "00:00:50", end: "00:01:00" },
  ],
  concurrencyLimit: 2,
};
