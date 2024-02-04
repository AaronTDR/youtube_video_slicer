import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

import path from "path";

import validateTimestamps from "./validateTimestamps.js";
import subtractTimestamps from "./subtractTimestamps.js";

/* 
const captureAndCutVideo = (inputVideoPath, timestamps, outputFile) => {
  const wrongIndices = validateTimestamps(timestamps);

  if (wrongIndices)
    return console.error(
      `start property cannot be greater than end property, error in timestamps position: ${wrongIndices.indices}`
    );

  const outputFolderPath = outputFile;

  if (!fs.existsSync(outputFolderPath)) {
    fs.mkdirSync(outputFolderPath);
  }

  timestamps.forEach((timestamp, index) => {
    const { start, end } = timestamp;
    const outputFileName =
      new Date().toISOString().replace(/:/g, "-") + `_segment_${index + 1}.mp4`;
    const outputFilePath = `${outputFolderPath}/${outputFileName}`;

    ffmpeg(inputVideoPath)
      .setStartTime(start)
      .setDuration(subtractTimestamps(end, start))
      .on("end", () => {
        console.log(`Segment ${index + 1} saved: ${outputFileName}`);
      })
      .on("error", (err) => {
        console.error(`Error processing segment ${index + 1}: ${err.message}`);
      })
      .save(outputFilePath);
  });
};
*/

const captureAndCutVideo = (inputVideoPath, timestamps, outputFile) => {
  return new Promise((resolve, reject) => {
    const wrongIndices = validateTimestamps(timestamps);

    if (wrongIndices) {
      reject(
        new Error(
          `start property cannot be greater than end property, error in timestamps position: ${wrongIndices.indices}`
        )
      );
      return;
    }

    const outputFolderPath = outputFile;

    if (!fs.existsSync(outputFolderPath)) {
      reject(new Error("The directory already exists"));
      return;
    }

    const promises = timestamps.map((timestamp, index) => {
      return new Promise((segmentResolve, segmentReject) => {
        const { start, end } = timestamp;
        const outputFileName =
          new Date().toISOString().replace(/:/g, "-") +
          `_segment_${index + 1}.mp4`;
        const outputFilePath = path.join(outputFolderPath, outputFileName);

        const ffmpegCommand = ffmpeg(inputVideoPath)
          .setStartTime(start)
          .setDuration(subtractTimestamps(end, start))
          .on("end", () => {
            console.log(`Segment ${index + 1} saved: ${outputFileName}`);
            segmentResolve();
          })
          .on("error", (err) => {
            console.error(
              `Error processing segment ${index + 1}: ${err.message}`
            );
            segmentReject(
              new Error(`Error processing segment ${index + 1}: ${err.message}`)
            );
          })
          .save(outputFilePath);

        // Handle FFmpeg process errors
        ffmpegCommand._process.on("error", (err) => {
          console.error(`FFmpeg process error: ${err.message}`);
          segmentReject(new Error(`FFmpeg process error: ${err.message}`));
        });
      });
    });

    Promise.all(promises)
      .then(() => {
        resolve("All segments processed successfully");
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export default captureAndCutVideo;
