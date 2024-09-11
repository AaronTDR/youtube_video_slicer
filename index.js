import { config } from "./config.js";

import downloadVideoYtDlp from "./downloadVideo/downloadVideo.js";
import cutAndConcatenateVideo from "./cutAndConcatenateVideo/cutAndConcatenateVideo.js";

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
  ffmpeg_exe_path,
  ffprobe_exe_path,
  workingFolderPath,
  segmentsFolderPath,
  url,
  timestamps,
  concurrencyLimit,
} = config;

const ytConcatenateSlices = async (
  ffmpeg_exe_path,
  ffprobe_exe_path,
  workingFolderPath,
  segmentsFolderPath,
  url,
  timestamps
) => {
  try {
    // Validations
    await validations(url, timestamps, workingFolderPath);

    // helpGetVideoTitle and downloadVideoYtDlp are called
    const [title, { temporalVideoName, videoExtension }] = await Promise.all([
      helpGetVideoTitle(url),
      downloadVideoYtDlp(url, workingFolderPath),
    ]);

    await cutAndConcatenateVideo(
      ffmpeg_exe_path,
      ffprobe_exe_path,
      title,
      workingFolderPath,
      segmentsFolderPath,
      timestamps,
      temporalVideoName,
      videoExtension,
      concurrencyLimit
    );

    // Delete temporary video
    await deleteFile(workingFolderPath + temporalVideoName + videoExtension);
  } catch (error) {
    console.error("Error occurred at validations function.");
  }
};

ytConcatenateSlices(
  ffmpeg_exe_path,
  ffprobe_exe_path,
  workingFolderPath,
  segmentsFolderPath,
  url,
  timestamps,
  concurrencyLimit
);
