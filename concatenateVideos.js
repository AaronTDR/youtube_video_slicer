import fs from "fs";
import { exec } from "child_process";
import path from "path";

/* const concatenateVideos = (inputDirectory) => {
  const outputFile = `${inputDirectory}_final_concatenated.mp4`;

  // Check if the output file already exists
  if (fs.existsSync(outputFile)) {
    console.error(
      "The output file already exists. Cannot perform concatenation."
    );
    return;
  }

  // Get list of files in folder
  fs.readdir(inputDirectory, (err, files) => {
    if (err) {
      console.error("Error reading folder:", err);
      return;
    }

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
    const archivosConcatenar = orderedVideos
      .map((video) => `file '${inputDirectory}${video}'`)
      .join("\n");

    // Create a concatenation list file
    const listaConcatenacion = "concat.txt";
    fs.writeFileSync(listaConcatenacion, archivosConcatenar);

    // Run ffmpeg to concatenate the videos
    const comandoFFmpeg = `ffmpeg -f concat -safe 0 -i ${listaConcatenacion} -c copy ${outputFile}`;

    exec(comandoFFmpeg, (error) => {
      if (error) {
        console.error("Error when running ffmpeg:", error);
        return;
      }

      // Change file names after concatenation, flag '_ segment _' to '_ concatenated _'
      videos.forEach((file) => {
        const filePath = `${inputDirectory}${file}`;
        const newFileName = file.replace(/_segment_/, "_concatenated_");
        fs.renameSync(filePath, `${inputDirectory}${newFileName}`);
        console.log(`Renowned: ${filePath} -> ${inputDirectory}${newFileName}`);
      });

      console.log(
        `Videos successfully concatenated. New video created: ${outputFile}`
      );
    });
  });
};
concatenateVideos("C:/Users/aaron/Downloads/result/"); */

// Promises
const concatenateVideos = (inputDirectory) => {
  return new Promise((resolve, reject) => {
    const outputFile = path.join(inputDirectory, "_final_test_1.mp4");

    // Check if the output file already exists
    if (fs.existsSync(outputFile)) {
      reject(
        new Error(
          "The output file already exists. Cannot perform concatenation."
        )
      );
      return;
    }

    // Get list of files in folder
    fs.readdir(inputDirectory, (err, files) => {
      if (err) {
        reject(new Error(`Error reading folder: ${err}`));
        return;
      }

      // Filter only video files that contain _segment_{segment_number} in their name
      const videos = files.filter((file) => /_segment_\d+/.test(file));

      // Check if there are at least two videos to concatenate
      if (videos.length < 2) {
        reject(new Error("At least two videos are needed to concatenate."));
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
      const concatenationList = "concat.txt";
      fs.writeFileSync(concatenationList, concatenateFiles);

      // Run ffmpeg to concatenate the videos
      const commandFFmpeg = `ffmpeg -f concat -safe 0 -i ${concatenationList} -c copy ${outputFile}`;

      exec(commandFFmpeg, (error) => {
        if (error) {
          reject(new Error(`Error when running ffmpeg: ${error}`));
          return;
        }

        // Change file names after concatenation, flag '_ segment _' to '_ concatenated _'
        videos.forEach((file) => {
          const filePath = `${inputDirectory}${file}`;
          const newFileName = file.replace(/_segment_/, "_concatenated_");
          fs.renameSync(filePath, `${inputDirectory}${newFileName}`);
          console.log(
            `Renamed: ${filePath} -> ${inputDirectory}${newFileName}`
          );
        });

        console.log(
          `Videos successfully concatenated. New video created: ${outputFile}`
        );
        resolve(outputFile);
      });
    });
  });
};

export default concatenateVideos;
