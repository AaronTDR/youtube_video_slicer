import { config } from "./config.js";

import concatenateVideos from "./concatenateVideos/concatenateVideos.js";
import captureAndCutVideo from "./captureAndCutVideo/captureAndCutVideo.js";
import downloadVideoYtDlp from "./downloadVideo/downloadVideo.js";

import validations from "./validations/validations.js";

import helpGetVideoTitle from "./helpers/helpGetVideoTitle.js";

import { deleteFile } from "./utils/functions.js";

/*
 * url: Address of the video you want to section.
 * directoryPath: Path of the directory where the temporary files will be stored and where the final result will be saved.
 * timestamps: Array corresponding to timestamps in HH:MM:SS format.
 * concurrencyLimit: Limit the number of segments that are processed at a time.
 * ffmpeg_exe_path: Path to ffmpeg executable.
 * ffprobe_exe_path: Path to ffprobe executable
 */

const {
  url,
  timestamps,
  directoryPath,
  concurrencyLimit,
  ffmpeg_exe_path,
  ffprobe_exe_path,
} = config;

const ytConcatenateSlices = async (
  videoUrl,
  timestamps,
  directoryPath,
  concurrencyLimit,
  ffmpeg_exe_path,
  ffprobe_exe_path
) => {
  try {
    // Validations
    await validations(videoUrl, timestamps, directoryPath);

    // helpGetVideoTitle and downloadVideoYtDlp are called
    const [title, { temporalVideoName, videoExtension }] = await Promise.all([
      helpGetVideoTitle(videoUrl),
      downloadVideoYtDlp(videoUrl, directoryPath),
    ]);

    const { temporalVideoPath } = await captureAndCutVideo(
      directoryPath,
      timestamps,
      temporalVideoName,
      videoExtension,
      directoryPath,
      concurrencyLimit
    );

    // Delete temporary video
    await deleteFile(temporalVideoPath);

    const concatenatedVideo = await concatenateVideos(
      directoryPath,
      title,
      videoExtension
    );

    console.log("Concatenated video: ", concatenatedVideo);
  } catch (error) {
    console.error("Error occurred at validations function.");
  }
};

ytConcatenateSlices(
  url,
  timestamps,
  directoryPath,
  concurrencyLimit,
  ffmpeg_exe_path,
  ffprobe_exe_path
);
