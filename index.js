import concatenateVideos from "./concatenateVideos/concatenateVideos.js";
import captureAndCutVideo from "./captureAndCutVideo/captureAndCutVideo.js";
import downloadVideoYtDlp from "./downloadVideo/downloadVideo.js";

import validateTimestamps from "./validations/validateTimestamps.js";
import validateMaxDuration from "./validations/validateMaxDuration.js";

import helpGetVideoTitle from "./helpers/helpGetVideoTitle.js";

import { deleteFile } from "./utils/functions.js";

/*
 * url: Address of the video you want to section.
 * directoryPath: Path of the directory where the temporary files will be stored and where the final result will be saved.
 * timestamps: Array corresponding to timestamps in HH:MM:SS format.
 */

const url = "";
const timestamps = [];
const directoryPath = "";

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
