export const config = {
  ffmpeg_exe_path: "C:/ProgramData/chocolatey/lib/ffmpeg/tools/ffmpeg/bin/ffmpeg.exe",
  ffprobe_exe_path: "C:/ProgramData/chocolatey/lib/ffmpeg/tools/ffmpeg/bin/ffprobe.exe",
  workingFolderPath: "E:/projects/youtube_video_slicer/output/",
  segmentsFolderPath: "E:/projects/youtube_video_slicer/output/segments/",
  url: "https://www.youtube.com/watch?v=pDOHwsFkaFE",
  timestamps: [
    { start: "00:00:07", end: "00:00:08" },
    { start: "00:00:07", end: "00:00:08" },
    { start: "00:00:07", end: "00:00:08" },
  ],
  concurrencyLimit: 2,
  shortsConfig: {
    shortThumbnailPath: 'E:/projects/youtube_video_slicer/output/short_1.jpg',
    generateThumbnail: false,
  },
  isYoutubeShort: true,
};
