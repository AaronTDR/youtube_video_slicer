import fs from "fs";
import { exec, execSync } from "child_process";
import path from "path";

const concatenateVideosMarcosPromises = async (
  inputDirectory,
  url,
  videoExtension
) => {
  // Get video name
  const command = `yt-dlp --print-json --skip-download ${url}`;
  const output = execSync(command).toString();
  const jsonData = JSON.parse(output);
  const title = jsonData.title;

  // Reemplaza caracteres especiales con guiones bajos
  const removeSpecialCharacters = (inputString) => {
    const replaceSpacesRegex = /\s+/g;
    const removeSpecialCharactersRegex = /[^\p{Letter}\d\-_]/gu;

    const replacedSpaces = inputString.replace(replaceSpacesRegex, "_");

    const cleanedString = replacedSpaces.replace(
      removeSpecialCharactersRegex,
      ""
    );

    return cleanedString;
  };

  const cleanedTitle = removeSpecialCharacters(title);

  const outputFileName = path.join(
    inputDirectory,
    `_final_${cleanedTitle}${videoExtension}`
  );

  // Check if the output file already exists
  if (fs.existsSync(outputFileName)) {
    console.error(
      "The output file already exists. Cannot perform concatenation."
    );
    return;
  }

  // Get list of files in folder
  const filesPromise = new Promise((resolve, reject) => {
    fs.readdir(inputDirectory, (err, files) => {
      if (err) {
        console.error("Error reading folder:", err);
        reject(err);
      } else resolve(files);
    });
  });

  const files = await filesPromise;

  // Filter only video files that contain _segment_{segment_number}' in their name
  const videos = files.filter((file) => /_segment_\d+/.test(file));

  // Check if there are at least two videos to concatenate
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
    exec(commandFFmpeg, (error) => {
      if (error) {
        console.error("Error when running ffmpeg:", error);
        return reject(error);
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
      resolve(outputFileName);
    });
  });
  return execPromise;
};

export default concatenateVideosMarcosPromises;
