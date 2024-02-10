import fs from "fs";
import path from "path";

// Returns the length of the video in HH:MM:SS format
export const formatTime = (time) => {
  const removeColon = (inputString) => inputString.replace(/:/g, "");

  if (typeof time !== "string") {
    console.log("Invalid time");

    return;
  }
  const timeWithoutColon = removeColon(time);

  const digits = timeWithoutColon.split("");
  if (digits.length === 0 || digits.length > 6 || typeof time !== "string") {
    console.log("Invalid time");
    return;
  }

  if (digits.length === 1) {
    return `00:00:0${digits[0]}`;
  }

  if (digits.length === 2) {
    return `00:00:${digits[0]}${digits[1]}`;
  }

  if (digits.length === 3) {
    return `00:0${digits[0]}:${digits[1]}${digits[2]}`;
  }

  if (digits.length === 4) {
    return `00:${digits[0]}${digits[1]}:${digits[2]}${digits[3]}`;
  }

  if (digits.length === 5) {
    return `0${digits[0]}:${digits[1]}${digits[2]}:${digits[3]}${digits[4]}`;
  }

  if (digits.length === 6) {
    return `${digits[0]}${digits[1]}:${digits[2]}${digits[3]}:${digits[4]}${digits[5]}`;
  }

  console.log("Invalid time format");
};

// Convert a timestamp to seconds
export const getSeconds = (timestamp) => {
  const [hours, minutes, seconds] = timestamp.split(":").map(Number);
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
export const getFiles = (directoryPth) =>
  new Promise((resolve, reject) => {
    fs.readdir(directoryPth, (err, files) => {
      if (err) {
        console.error("Error reading folder:", err.message);
        reject(err);
      } else {
        resolve(files);
      }
    });
  });

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
export const getExtension = (directoryPath, videoName) => {
  try {
    // Read the contents of the specified directory synchronously.
    const files = fs.readdirSync(directoryPath);

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
    console.log(error);
    return ".mp4";
  }
};
