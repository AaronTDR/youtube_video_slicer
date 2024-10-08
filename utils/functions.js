import fs from "fs";
import fsPromises from "fs/promises";
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

// Convert seconds to timestamp
export const secondsToTimestamp = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const resultingSeconds = seconds % 60;

  // Format timestamp
  const format = (value) => (value < 10 ? `0${value}` : `${value}`);

  return `${format(hours)}:${format(minutes)}:${format(resultingSeconds)}`;
};

// Replace special characters with underscores
export const removeSpecialCharacters = (inputString) => {
  const replaceSpacesRegex = /\s+/g;
  const removeSpecialCharactersRegex = /[^\p{Letter}\d\-_]/gu;

  const replacedSpaces = inputString.replace(replaceSpacesRegex, "_");

  const cleanedString = replacedSpaces.replace(
    removeSpecialCharactersRegex,
    ""
  );

  return cleanedString;
};

// Get list of files in folder
export const getFiles = async (directoryPath) => {
  try {
    const files = await fsPromises.readdir(directoryPath);
    return files;
  } catch (error) {
    console.error("Error reading folder:", error.message);
    throw error;
  }
};

export const deleteFile = (directoryPath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(directoryPath, (err) => {
      if (err) {
        reject(new Error(`"Error deleting the file:", ${err.message}`));
      } else {
        console.log("File successfully deleted.");
        resolve();
      }
    });
  });
};

// Get extension file
export const getExtension = async (directoryPath, videoName) => {
  try {
    // Read the contents of the specified directory synchronously.
    const files = await fsPromises.readdir(directoryPath);

    // Find a file in the list that includes the specified videoName.
    const foundFile = files.find((file) => file.includes(videoName));

    if (foundFile) {
      const videoExtension = path.extname(foundFile);
      return videoExtension;
    } else {
      throw new Error(
        `Video: '${videoName}' not found in directory: '${directoryPath}', the file extension could not be obtained `
      );
    }
  } catch (error) {
    console.error(error);
  }
};

// Run promises in batches
export const processInBatches = async (tasks, limit) => {
  try {
    let batchNumber = 1;
    const results = [];
    const executing = new Set();

    console.log("\nNumber of batches to be processed: ", tasks.length);

    for (const task of tasks) {
      const p = task().then((result) => {
        executing.delete(p);
        return result;
      });
      results.push(p);
      executing.add(p);

      if (executing.size >= limit) {
        console.log("Processing batch of segments. Number: ", batchNumber);
        await Promise.race(executing);
        batchNumber++;
      }
    }
    console.log("Processing batch of segments. Number: ", batchNumber);
    return Promise.all(results);
  } catch (error) {
    console.error(error);
  }
};
