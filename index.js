import validations from "./validations/validations.js";
import downloadVideoYtDlp from "./downloadVideo/downloadVideo.js";
import cutAndConcatenateVideo from "./cutAndConcatenateVideo/cutAndConcatenateVideo.js";
import {
  deleteFile,
  filterDuplicates,
  processFilteredResults,
} from "./utils/functions.js";
import { getTargetExtension } from "./extension.js";
import { config } from "./config.js";

const {
  workingFolderPath,
  segmentsFolderPath,
  timestamps,
  deleteDownloadedVideos,
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
    if (deleteDownloadedVideos === true) {
      try {
        await Promise.all(
          downloadedVideoPaths.map((file) => {
            deleteFile(`${file}${getTargetExtension()}`);
          })
        );
        console.log("All source videos were successfully deleted.");
      } catch (error) {
        console.error("Error deleting files:", error);
      }
    } else {
      if (downloadedVideoPaths.length) {
        console.log(
          "Source videos stored in the routes: ",
          downloadedVideoPaths
        );
      }
    }

    console.log("-----DONE-----");
  } catch (error) {
    console.error("Error occurred at index.", error);
  }
};

ytConcatenateSlices();
