import concatenateVideos from "./concatenateVideos.js";
import helpDeleteVideo from "./helpers/helpDeleteVideo.js";
import captureAndCutVideo from "./captureAndCutVideo/captureAndCutVideo.js";
import downloadVideoYtDlp from "./downloadVideo/downloadVideo.js";

import validateTimestamps from "./validations/validateTimestamps.js";
import validateMaxDuration from "./validations/validateMaxDuration.js";

/*
 * directoryPath: Path of the directory where the temporary files will be stored and where the final result will be saved.
 */

const url = "https://www.youtube.com/watch?v=jhvfYsYQXkc&t=1s"; //  vuelta mundo 01:00
// const url = "https://www.youtube.com/watch?v=x4KsG9wKLqo"; // yama 01:15
// const url = "https://www.youtube.com/watch?v=V91v3DmizJs"; // soldados
// const url = "https://www.youtube.com/watch?v=WO2b03Zdu4Q"; // LG 4k 00:45 (con este falla)
// const url = "https://www.youtube.com/watch?v=WO2b03Zdu4Q"; // el buen freddy, 15:02 minutos
// const url = "https://www.youtube.com/watch?v=69qKUoGhoQo";

const timestamps = [
  { start: "00:00:00", end: "00:00:06" },
  { start: "00:00:20", end: "00:00:25" },
  { start: "00:00:30", end: "00:00:40" },
  { start: "00:05:30", end: "00:06:00" },
  { start: "00:10:00", end: "00:16:48" },
];
// const outputFile = "E:/projects/youtube_video_slicer/output";
const directoryPath = "C:/users/aaron/downloads/test/";

/*
 - ¿Qué pasa si la marca de tiempo dura más que el video?
*/
const ytConcatenateSlices = async (videoUrl, timestamps, directoryPath) => {
  // Validates that in all timestamps the start property is less than the end property
  const wrongIndices = validateTimestamps(timestamps);
  if (wrongIndices) {
    console.error(
      `start property cannot be greater than end property, error in timestamps position: ${wrongIndices.indices}`
    );
    return;
  }

  // Validate if timestamp exceeds video duration
  const wrongMaxDurationTime = await validateMaxDuration(videoUrl, timestamps);
  if (wrongMaxDurationTime) {
    console.error("Video duration exceeded by timestamp");
    return;
  }

  try {
    console.log("before downloadVideo");
    const { temporalVideoName, videoExtension } = await downloadVideoYtDlp(
      videoUrl,
      directoryPath
    );
    console.log("Processing segments...\n\n");
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
    await helpDeleteVideo(temporalVideoPath);
    console.log("temporary video deleted");

    console.log("before concatenateVideos");
    const concatenatedVideo = await concatenateVideos(
      directoryPath,
      videoUrl,
      videoExtension
    );
    console.log("after concatenateVideos\n\n");

    console.log("Concatenated video: ", concatenatedVideo);
  } catch (error) {
    console.error("Something went wrong: ", error);
  }
};

ytConcatenateSlices(url, timestamps, directoryPath);
