export const config = {
  ffmpeg_exe_path: "",
  ffprobe_exe_path: "",
  workingFolderPath: "",
  segmentsFolderPath: "",
  deleteDownloadedVideos: false,
  timestamps: [
    {
      start: "00:00:10.478",
      end: "00:00:12.951",
      url: "",
    },
    {
      start: "00:00:05.478",
      end: "00:00:06.951",
      path: "",
    },
  ],
  concurrencyLimit: 2,
  targetFormat: ".webm",
  shortsConfig: {
    shortThumbnailPath: "",
    generateThumbnail: false,
  },
  isYoutubeShort: false,
};
