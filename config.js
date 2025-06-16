export const config = {
  ffmpeg_exe_path: "C:/ProgramData/chocolatey/lib/ffmpeg/tools/ffmpeg/bin/ffmpeg.exe",
  ffprobe_exe_path: "C:/ProgramData/chocolatey/lib/ffmpeg/tools/ffmpeg/bin/ffprobe.exe",
  workingFolderPath: "E:/projects/youtube_video_slicer/output/",
  segmentsFolderPath: "E:/projects/youtube_video_slicer/output/segments/",
  deleteDownloadedVideos: false,
  timestamps: [
    {
      start: "00:25:33.750",
      end: "00:25:53.000", //
      url: "https://www.youtube.com/watch?v=Yu2yhUhud1w" // Halo 4 - Parte 5
    },
    {
      start: "00:28:35.300",
      end: "00:28:49.100", //
      url: "https://www.youtube.com/watch?v=Yu2yhUhud1w" // Halo 4 - Parte 5
    },
    {
      start: "00:13:49.500",
      end: "00:14:35.900", //
      url: "https://www.youtube.com/watch?v=gKUJotXalGU" // Halo 4 - Parte 6
    },
    {
      start: "00:19:18.300",
      end: "00:20:11.000", //
      url: "https://www.youtube.com/watch?v=gKUJotXalGU" // Halo 4 - Parte 6
    },
    {
      start: "00:23:37.900",
      end: "00:23:48.300", //
      url: "https://www.youtube.com/watch?v=gKUJotXalGU" // Halo 4 - Parte 6
    },
    {
      start: "00:40:05.000",
      end: "00:40:37.600", //
      url: "https://www.youtube.com/watch?v=gKUJotXalGU" // Halo 4 - Parte 6
    },
    {
      start: "00:23:50.200",
      end: "00:24:11.700", //
      url: "https://www.youtube.com/watch?v=w-l2ioNya20" // Halo 4 - Parte 7
    },
    {
      start: "00:31:54.300",
      end: "00:32:26.600", //
      url: "https://www.youtube.com/watch?v=w-l2ioNya20" // Halo 4 - Parte 7
    },
    {
      start: "00:39:25.000",
      end: "00:40:17.350", //
      url: "https://www.youtube.com/watch?v=w-l2ioNya20" // Halo 4 - Parte 7
    },
    {
      start: "00:44:47.300",
      end: "00:45:03.300", //
      url: "https://www.youtube.com/watch?v=w-l2ioNya20" // Halo 4 - Parte 7
    },
    // {
    //   start: "00:xx:xx.x00",
    //   end: "00:xx:xx.x00", //
    //   url: "https://www.youtube.com/watch?v=w-l2ioNya20" // Halo 4 - Parte 7
    // },
  ],
  concurrencyLimit: 4,
  shortsConfig: {
    shortThumbnailPath: "",
    generateThumbnail: false,
  },
  isYoutubeShort: false,
};

function timeToSeconds(timeStr) {
  const [hh, mm, ss] = timeStr.split(":");
  return parseInt(hh) * 3600 + parseInt(mm) * 60 + parseFloat(ss);
}

const totalSeconds = config.timestamps.reduce((sum, { start, end }) => {
  return sum + (timeToSeconds(end) - timeToSeconds(start));
}, 0);

const totalMinutes = totalSeconds / 60;

console.log("Total minutes: ", totalMinutes.toFixed(2));