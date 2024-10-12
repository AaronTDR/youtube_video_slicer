export const config = {
  ffmpeg_exe_path: "ffmpeg",
  ffprobe_exe_path: "ffprobe",
  workingFolderPath: "C:/users/aaron/downloads/result/",
  segmentsFolderPath: "C:/users/aaron/downloads/result/segments/",
  timestamps: [
    {
      start: "00:00:10.478",
      end: "00:00:19.951",
      path: "C:/users/aaron/downloads/result/video-5.mp4",
    },
    {
      start: "00:00:04.034",
      end: "00:00:06.282",
      path: "C:/users/aaron/downloads/result/video-2.mp4",
    },
    {
      start: "00:00:09.478",
      end: "00:00:12.951",
      path: "C:/users/aaron/downloads/result/video-1.mp4",
    },
    {
      start: "00:00:18.478",
      end: "00:00:25.951",
      path: "C:/users/aaron/downloads/result/video-5.mp4",
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
