import concatenateVideos from "./concatenateVideos.js";
import captureAndCutVideo from "./captureAndCutVideo/captureAndCutVideo.js";
import downloadVideoYtDlp from "./downloadVideo/downloadVideo.js";

import validateTimestamps from "./validations/validateTimestamps.js";
import validateMaxDuration from "./validations/validateMaxDuration.js";

import helpGetVideoTitle from "./helpers/helpGetVideoTitle.js";

import { deleteFile } from "./utils/functions.js";

/*
 * directoryPath: Path of the directory where the temporary files will be stored and where the final result will be saved.
 */

const url = "https://www.youtube.com/watch?v=jhvfYsYQXkc"; //  vuelta mundo 01:00
// const url = "https://www.youtube.com/watch?v=x4KsG9wKLqo"; // yama 01:15
// const url = "https://www.youtube.com/watch?v=V91v3DmizJs"; // soldados
// const url = "https://www.youtube.com/watch?v=WO2b03Zdu4Q"; // LG 4k 00:45 (con este falla)
// const url = "https://www.youtube.com/watch?v=WO2b03Zdu4Q"; // el buen freddy, 15:02 minutos
// const url = "https://www.youtube.com/watch?v=69qKUoGhoQo";

const timestamps = [
  { start: "00:00:00", end: "00:00:06" },
  { start: "00:00:20", end: "00:00:25" },
  /*{ start: "00:00:30", end: "00:00:40" },
     { start: "00:05:30", end: "00:06:00" },
  { start: "00:10:00", end: "00:16:48" }, */
];
const directoryPath = "E:/projects/youtube_video_slicer/output";
// const directoryPath = "C:/users/aaron/downloads/test/";

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
    // helpGetVideoTitle and downloadVideoYtDlp are called
    const [title, { temporalVideoName, videoExtension }] = await Promise.all([
      helpGetVideoTitle(videoUrl),
      downloadVideoYtDlp(videoUrl, directoryPath),
    ]);

    const { promises, temporalVideoPath } = await captureAndCutVideo(
      directoryPath,
      timestamps,
      temporalVideoName,
      videoExtension,
      directoryPath
    );

    await Promise.all(promises);

    // Delete temporary video
    await deleteFile(temporalVideoPath);

    const concatenatedVideo = await concatenateVideos(
      directoryPath,
      title,
      videoExtension
    );

    console.log("Concatenated video: ", concatenatedVideo);
  } catch (error) {
    console.error("Something went wrong: ", error);
  }
};

ytConcatenateSlices(url, timestamps, directoryPath);
