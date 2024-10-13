import fs from "fs";
import path from "path";

// Returns the length of the video in HH:MM:SS format
/*
 * This function formats the argument obtained from the yt-dlp --get-duration command, which returns results in the following manner based on the digits corresponding to the video duration:
  - Video with a duration of 5 seconds = 5
  - Video with a duration of 10 seconds = 10
  - Video with a duration of 1 minute = 1:00
  - Video with a duration of 10 minutes = 10:00
  - Video with a duration of 1 hour = 1:00:00
  - Video with a duration of 10 hours = 10:00:00
*/
export const formatTime = (time) => {
  if (typeof time !== "string") {
    throw new Error(
      `Error at formatTime function, invalid argument: argument should be a string, value received as argument 'time': ${time}`
    );
  }

  // If it is a single number (1 or 2 digits), we treat it as seconds
  if (/^\d{1,2}$/.test(time)) {
    const seconds = Number(time);
    return `00:00:${String(seconds).padStart(2, "0")}.000`;
  }

  // Divide the time by ":"
  const parts = time.split(":").map(Number);

  // Validates if the format is minutes and seconds (MM:SS)
  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    if (minutes > 59 || seconds > 59) {
      throw new RangeError(
        `Invalid time format. Minutes or seconds exceed valid ranges in argument: ${time}`
      );
    }
    return `00:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}.000`;
  } else if (parts.length === 3) {
    // Validates if the format is hours, minutes and seconds(HH:MM:SS)
    const [hours, minutes, seconds] = parts;
    if (hours > 23 || minutes > 59 || seconds > 59) {
      throw new RangeError(
        `Invalid time format. Hours, minutes or seconds exceed valid ranges in argument: ${time}`
      );
    }
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}.000`;
  } else {
    throw new RangeError(
      `Invalid time format. Argument should be in 'MM:SS' or 'HH:MM:SS' format, received: ${time}`
    );
  }
};

// Convert a timestamp to seconds
export const getSeconds = (timestamp) => {
  let hours,
    minutes,
    seconds,
    milliseconds = 0;

  const timeParts = timestamp.split(":").map((part, idx) => {
    if (idx === 2 && part.includes(".")) {
      const [sec, ms] = part.split(".");
      seconds = Number(sec);
      milliseconds = Number(ms);
    } else {
      return Number(part);
    }
  });

  // Assign hours and minutes to the first two elements of the array
  [hours, minutes] = timeParts;

  // Validate hours, minutes, seconds, and milliseconds
  if (
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59 ||
    seconds < 0 ||
    seconds > 59 ||
    milliseconds < 0 ||
    milliseconds > 999
  ) {
    throw new RangeError(
      "Invalid timestamp format. Hours, minutes, seconds, or milliseconds exceed valid ranges."
    );
  }

  // Calculate the total in seconds including milliseconds
  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
};

export const deleteFile = (directoryPath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(directoryPath, (err) => {
      if (err) {
        reject(new Error(`"Error deleting the file:", ${err.message}`));
      } else {
        console.log(`File ${directoryPath} successfully deleted.`);
        resolve();
      }
    });
  });
};

// Get extension file
export const getExtension = (filePath) => {
  const videoExtension = path.extname(filePath);
  return videoExtension;
};

export const processInBatches = async (tasks, limit) => {
  try {
    let batchNumber = 1;
    const results = [];

    console.log(`Total number of tasks: ${tasks.length}`);

    for (let i = 0; i < tasks.length; i += limit) {
      const batch = tasks.slice(i, i + limit);
      console.log(
        `Processing batch ${batchNumber}. Tasks in this batch: ${batch.length}`
      );

      const batchPromises = batch.map((task, index) => {
        return task()
          .then((result) => {
            console.log(`Task ${i + index + 1} completed successfully`);
            return result;
          })
          .catch((error) => {
            console.error(
              `Error in task ${i + index + 1} of batch ${batchNumber}:`,
              error
            );
            return null;
          });
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter((result) => result !== null));

      console.log(`Finished processing batch ${batchNumber}`);
      batchNumber++;
    }

    console.log(`All batches processed. Total results: ${results.length}`);
    return results;
  } catch (error) {
    console.error("Error in processInBatches:", error);
  }
};

// Get ID from URL
export const getIdFromUrl = (url) => {
  const idMatch = url.match(/v=([a-zA-Z0-9_-]+)/);
  return idMatch ? idMatch[1] : null;
};

// Filter duplicate items
export const filterDuplicates = (timestamps) => {
  const uniquePaths = new Set();
  return timestamps.filter((item) => {
    const path = item.url || item.path;
    if (!uniquePaths.has(path)) {
      uniquePaths.add(path);
      return true;
    }
    return false;
  });
};

// Filters the videos to be downloaded and returns an array of promises to perform the downloads simultaneously
export const processFilteredResults = (
  filteredResults,
  workingFolderPath,
  callback
) => {
  // Filters out elements that contain 'url' and lack 'path'
  const filteredElements = filteredResults.filter(
    (item) => item.url && !item.path
  );

  // Create a promise arrangement
  const promises = filteredElements.map((element) =>
    callback(element.url, workingFolderPath)
  );

  return promises;
};

export function updateUrlsWithPaths(workingFolderPath, timestamps) {
  const updatedTimestamps = timestamps.map((timestamp) => {
    // Clone the object to avoid mutation of the original
    const newTimestamp = { ...timestamp };

    if (newTimestamp.url) {
      // Get the last 11 digits of the URL
      const searchKey = newTimestamp.url.slice(-11);

      // Find the file in the working directory
      let foundPath = null;
      const files = fs.readdirSync(workingFolderPath);

      for (const file of files) {
        if (file.includes(searchKey)) {
          foundPath = path.join(workingFolderPath, file);
          break;
        }
      }

      // If the file was found, update the object
      if (foundPath) {
        newTimestamp.path = foundPath;
        delete newTimestamp.url;
      }
    }
    return newTimestamp;
  });

  return updatedTimestamps;
}

export const generateSafeFileName = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  // Formato: YYYY-MM-DD_HH-MM-SS
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
};

// Helper function for FFmpeg time format
export const formatFFmpegTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = (seconds % 60).toFixed(3);
  return [hours, minutes, secs]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
};
