import validations from "./validations/validations.js";
import downloadVideoYtDlp from "./downloadVideo/downloadVideo.js";
import cutAndConcatenateVideo from "./cutAndConcatenateVideo/cutAndConcatenateVideo.js";
import {
  deleteFile,
  filterDuplicates,
  processFilteredResults,
} from "./utils/functions.js";
import { config } from "./config.js";

/*
 * directoryPath: Path of the directory where the temporary files will be stored and where the final result will be saved.
 * timestamps: Array corresponding to timestamps in HH:MM:SS format.
 * concurrencyLimit: Limit the number of segments that are processed at a time.
 * ffmpeg_exe_path: Path to ffmpeg executable.
 * ffprobe_exe_path: Path to ffprobe executable
 */

const {
  workingFolderPath,
  segmentsFolderPath,
  timestamps,
  deleteDownloadedVideos,
  targetFormat,
} = config;

const ytConcatenateSlices = async () => {
  try {
    await validations(timestamps, workingFolderPath, segmentsFolderPath);

    // Filter duplicate URLs, to only download each URL once
    const uniqueTimestamps = filterDuplicates(timestamps);

    // Download all videos asynchronously
    const downloadResults = await Promise.all(
      processFilteredResults(
        uniqueTimestamps,
        workingFolderPath,
        downloadVideoYtDlp
      )
    );

    // Filters null elements if they exist
    const downloadedVideoPaths = downloadResults.filter(
      (path) => path !== null
    );

    await cutAndConcatenateVideo();

    // Delete temporary video
    if (deleteDownloadedVideos) {
      try {
        await Promise.all(
          downloadedVideoPaths.map((file) =>
            deleteFile(`${file}${targetFormat}`)
          )
        );
        console.log("All source videos were successfully deleted.");
      } catch (error) {
        console.error("Error deleting files:", error);
      }
    }

    // Source video routes
    if (downloadedVideoPaths.filter((el) => el !== undefined).length) {
      console.log("Source videos stored in the routes: ", downloadedVideoPaths);
    }

    console.log("-----DONE-----");
  } catch (error) {
    console.error("Error occurred at index.", error);
  }
};

ytConcatenateSlices();
