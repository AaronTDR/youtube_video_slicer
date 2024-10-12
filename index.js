import { config } from "./config.js";

import downloadVideoYtDlp from "./downloadVideo/downloadVideo.js";
import cutAndConcatenateVideo from "./cutAndConcatenateVideo/cutAndConcatenateVideo.js";

import {
  deleteFile,
  filterDuplicates,
  processFilteredResults,
} from "./utils/functions.js";

import { promisify } from "util";
import { exec } from "child_process";
const execP = promisify(exec);

/*
 * directoryPath: Path of the directory where the temporary files will be stored and where the final result will be saved.
 * timestamps: Array corresponding to timestamps in HH:MM:SS format.
 * concurrencyLimit: Limit the number of segments that are processed at a time.
 * ffmpeg_exe_path: Path to ffmpeg executable.
 * ffprobe_exe_path: Path to ffprobe executable
 */

const { workingFolderPath, timestamps, concurrencyLimit } = config;

const ytConcatenateSlices = async () => {
  try {
    // Filter duplicate URLs, to only download each URL once
    const uniqueTimestamps = filterDuplicates(timestamps);

    // Download all videos asynchronously
    await Promise.all(
      processFilteredResults(
        uniqueTimestamps,
        workingFolderPath,
        downloadVideoYtDlp
      )
    );
    cutAndConcatenateVideo(concurrencyLimit, targetFormat);

    // Delete temporary video
    // await deleteFile(workingFolderPath + temporalVideoName + videoExtension);

    console.log("-----DONE-----");
  } catch (error) {
    console.error("Error occurred at index.", error);
  }
};

ytConcatenateSlices();
