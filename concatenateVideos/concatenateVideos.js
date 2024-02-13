import fs from "fs";
import { exec } from "child_process";
import path from "path";

import { removeSpecialCharacters, getFiles } from "../utils/functions.js";

const concatenateVideos = async (inputDirectory, title, videoExtension) => {
  // Replace special characters with underscores
  const cleanedTitle = removeSpecialCharacters(title);

  // Construct the output file name using the cleaned video title
  const outputFileName = path.join(
    inputDirectory, // The directory where the input files are located
    `_final_${cleanedTitle}${videoExtension}` // The final output file name
  );

  // Check if the output file already exists
  if (fs.existsSync(outputFileName)) {
    console.error(
      "The output file already exists. Cannot perform concatenation."
    );
    return;
  }

  // Get list of videos in folder
  const videoFiles = await getFiles(inputDirectory);

  // Filter only video files that contain _segment_{segment_number}' in their name
  const videos = videoFiles.filter((video) => /_segment_\d+/.test(video));

  // Validate if there are at least two videos to concatenate
  if (videos.length < 2) {
    console.error("At least two videos are needed to concatenate.");
    return;
  }

  // Create a list of input ordered by segment number
  const orderedVideos = videos
    .map((file) => file)
    .sort((a, b) => {
      const regex = /_segment_(\d+)\./;
      const numA = parseInt(a.match(regex)[1]);
      const numB = parseInt(b.match(regex)[1]);
      return numA - numB;
    });

  // Create a list of video files to concatenate
  const concatenateFiles = orderedVideos
    .map((video) => `file '${inputDirectory}${video}'`)
    .join("\n");

  // Create a concatenation list file
  const concatenateList = "concat.txt";
  fs.writeFileSync(concatenateList, concatenateFiles);

  // Run ffmpeg to concatenate the videos
  const commandFFmpeg = `ffmpeg -f concat -safe 0 -i ${concatenateList} -c copy ${outputFileName}`;

  const execPromise = new Promise((resolve, reject) => {
    exec(commandFFmpeg, (error, stdout, stderr) => {
      if (error) {
        console.error("Error when running ffmpeg:", error);
        console.error("FFmpeg stderr:", stderr);
        return reject(new Error(`Error when running ffmpeg: ${error.message}`));
      }

      // Change file names after concatenation, flag '_ segment _' to '_ concatenated _'
      videos.forEach((file) => {
        const filePath = `${inputDirectory}${file}`;
        const newFileName = file.replace(/_segment_/, "_concatenated_");
        fs.renameSync(filePath, `${inputDirectory}${newFileName}`);
        console.log(`Renowned: ${filePath} -> ${inputDirectory}${newFileName}`);
      });

      console.log(
        `Videos successfully concatenated. New video created: ${outputFileName}`
      );
      // delete concatenation list file
      fs.unlinkSync(concatenateList);
      resolve(outputFileName);
    });
  });
  return execPromise;
};

export default concatenateVideos;
