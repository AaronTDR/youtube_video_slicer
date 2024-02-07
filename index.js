import concatenateVideos from "./concatenateVideos.js";
import captureAndCutVideo from "./captureAndCutVideo/captureAndCutVideo.js";
// import downloadVideoMarcosPromise from "./downloadVideo/downloadVideo.js";

import downloadVideoYtDlp from "./downloadVideo/downloadVideo.js";
import deleteTemporalVideo from "./deleteTemporalVideo.js";

/*
 * directoryPath: Path of the directory where the temporary files will be stored and where the final result will be saved.
 */

// const url = "https://www.youtube.com/watch?v=jhvfYsYQXkc&t=1s"; //  vuelta mundo 01:00
const url = "https://www.youtube.com/watch?v=x4KsG9wKLqo"; // yama 01:15
// const url = "https://www.youtube.com/watch?v=V91v3DmizJs"; // soldados
// const url = "https://www.youtube.com/watch?v=WO2b03Zdu4Q"; // LG 4k 00:45 (con este falla)
// const url = "https://www.youtube.com/watch?v=WO2b03Zdu4Q"; // el buen freddy, 15:02 minutos

const timestamps = [
  { start: "00:00:00", end: "00:00:06" },
  { start: "00:00:20", end: "00:00:25" },
  { start: "00:00:30", end: "00:00:40" },
  /*   { start: "00:05:30", end: "00:06:00" },
  { start: "00:10:00", end: "00:10:50" }, */
];
// const outputFile = "E:/projects/youtube_video_slicer/output";
const directoryPath = "C:/users/aaron/downloads/test/";

/*
 - ¿Qué pasa si la marca de tiempo dura más que el video?
*/
const ytConcatenateSlices = async (videoUrl, timestamps, directoryPath) => {
  try {
    console.log("before downloadVideo");
    const { temporalVideoName, videoExtension } = await downloadVideoYtDlp(
      videoUrl,
      directoryPath
    );
    console.log("after downloadVideo\n\n");

    console.log("before captureAndCutVideo");
    const { promises, temporalVideoPath } = await captureAndCutVideo(
      directoryPath,
      timestamps,
      temporalVideoName,
      videoExtension,
      directoryPath
    );
    console.log("after captureAndCutVideo\n\n");
    await Promise.all(promises);
    // Delete temporary video
    await deleteTemporalVideo(temporalVideoPath);
    console.log("temporary video deleted");

    // console.log("before concatenateVideos");
    // const concatenatedVideo = await concatenateVideos(`${directoryPath}/`);
    // console.log("after concatenateVideos\n\n");

    // console.log("Concatenated video: ", concatenatedVideo);
  } catch (error) {
    console.error("Something went wrong: ", error);
  }
};

ytConcatenateSlices(url, timestamps, directoryPath);
