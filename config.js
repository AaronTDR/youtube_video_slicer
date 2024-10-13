export const config = {
  ffmpeg_exe_path: "ffmpeg",
  ffprobe_exe_path: "ffprobe",
  workingFolderPath: "C:/users/aaron/downloads/result/",
  segmentsFolderPath: "C:/users/aaron/downloads/result/segments/",
  deleteDownloadedVideos: false,
  timestamps: [
    {
      start: "00:00:18.478",
      end: "00:00:25.951",
      url: "",
    },
    {
      start: "00:00:10.478",
      end: "00:00:19.951",
      path: "",
    },
  ],
  concurrencyLimit: 2,
  targetFormat: ".mp4",
  shortsConfig: {
    shortThumbnailPath: "C:/users/aaron/downloads/result/short_1.png",
    generateThumbnail: false,
  },
  isYoutubeShort: false,
};
