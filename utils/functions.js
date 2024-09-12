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
  const removeColon = (inputString) => inputString.replace(/:/g, "");

  if (typeof time !== "string") {
    throw new Error(
      `Error at formatTime function, invalid argument: argument should be a string, value received as argument 'time': ${time}`
    );
  }
  const digits = removeColon(time);

  if (digits.length === 0 || digits.length > 6) {
    throw new RangeError(
      `Error at formatTime function, invalid argument: argument should have 1 to 6 digits, value received as argument 'time': ${time}`
    );
  }

  switch (digits.length) {
    case 1:
      return `00:00:0${digits[0]}`;
    case 2:
      return `00:00:${digits[0]}${digits[1]}`;
    case 3:
      return `00:0${digits[0]}:${digits[1]}${digits[2]}`;
    case 4:
      return `00:${digits[0]}${digits[1]}:${digits[2]}${digits[3]}`;
    case 5:
      return `0${digits[0]}:${digits[1]}${digits[2]}:${digits[3]}${digits[4]}`;
    case 6:
      return `${digits[0]}${digits[1]}:${digits[2]}${digits[3]}:${digits[4]}${digits[5]}`;
    default:
      throw new Error(`Error at formatTime function`);
  }
};

// Convert a timestamp to seconds
export const getSeconds = (timestamp) => {
  const [hours, minutes, seconds] = timestamp.split(":").map(Number);

  // Validate hours, minutes, and seconds
  if (
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59 ||
    seconds < 0 ||
    seconds > 59
  ) {
    throw new RangeError(
      "Invalid timestamp format. Hours, minutes, or seconds exceed valid ranges."
    );
  }
  return hours * 3600 + minutes * 60 + seconds;
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

    console.log('\nNumber of batches to be processed: ', tasks.length)


    for (const task of tasks) {
      const p = task().then((result) => {
        executing.delete(p);
        return result;
      });
      results.push(p);
      executing.add(p);

      console.log('Processing batch of segments. Number: ', batchNumber)
      if (executing.size >= limit) {
        await Promise.race(executing);
      }
      batchNumber++;
    }
    console.log()

    return Promise.all(results);
  } catch (error) {
    console.error(error);
  }
};
