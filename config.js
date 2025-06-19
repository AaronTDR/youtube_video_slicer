export const config = {
  ffmpeg_exe_path: "C:/ProgramData/chocolatey/lib/ffmpeg/tools/ffmpeg/bin/ffmpeg.exe",
  ffprobe_exe_path: "C:/ProgramData/chocolatey/lib/ffmpeg/tools/ffmpeg/bin/ffprobe.exe",
  workingFolderPath: "C:/projects/youtube_video_slicer/output/",
  segmentsFolderPath: "C:/projects/youtube_video_slicer/output/segments/",
  deleteDownloadedVideos: false,
  timestamps: [
    {
      start: "00:01:10.000",
      end: "00:01:20.000", //
      path: "E:/obs/testing/Halo_4___gKUJotXalGU.webm"
    },
    {
      start: "00:05:30.000",
      end: "00:05:55.000", //
      path: "E:/obs/ghost_recon_wildlands_2025-06-05 21-44-37.mkv"
    },
  ],
  concurrencyLimit: 4,
  shortsConfig: {
    shortThumbnailPath: "",
    generateThumbnail: false,
  },
  isYoutubeShort: false,
};
