export const config = {
  ffmpeg_exe_path: "ffmpeg",
  ffprobe_exe_path: "ffprobe",
  workingFolderPath: "C:/users/aaron/downloads/result/",
  segmentsFolderPath: "C:/users/aaron/downloads/result/segments/",
  deleteDownloadedVideos: true,
  timestamps: [
    {
      start: "00:00:05.478",
      end: "00:00:15.951",
      url: "",
    },
  ],
  concurrencyLimit: 2,
  shortsConfig: {
    shortThumbnailPath: "C:/users/aaron/downloads/result/short_1.png",
    generateThumbnail: true,
  },
  isYoutubeShort: true,
};
