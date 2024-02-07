import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

import path from "path";

import validateTimestamps from "./validateTimestamps.js";
import subtractTimestamps from "./subtractTimestamps.js";

const captureAndCutVideoMarcosPromises = (
  inputVideoDirectory,
  timestamps,
  temporalVideoName,
  videoFormat,
  outputDirectory
) => {
  return new Promise((resolve, reject) => {
    const wrongIndices = validateTimestamps(timestamps);

    if (wrongIndices) {
      console.error(
        `start property cannot be greater than end property, error in timestamps position: ${wrongIndices.indices}`
      );
      return;
    }

    if (!fs.existsSync(outputDirectory)) {
      console.error("Output folder does not exist");
      return;
    }
    // Add the temporary name of the video to the path
    const videoPath = path.join(inputVideoDirectory, temporalVideoName);
    // Add temporary video format
    const videoPathWithFormat = `${videoPath}${videoFormat}`;

    const promises = [];

    timestamps.forEach((timestamp, index) => {
      const { start, end } = timestamp;
      const outputFileName =
        new Date().toISOString().replace(/:/g, "-") +
        `_segment_${index + 1}${videoFormat}`;
      const outputFilePath = path.join(outputDirectory, outputFileName);
      const promise = new Promise((resolve, reject) => {
        ffmpeg(videoPathWithFormat)
          .setStartTime(start)
          .setDuration(subtractTimestamps(end, start))
          .on("end", () => {
            console.log(`Segment ${index + 1} saved: ${outputFileName}`);
            resolve();
          })
          .on("error", (err) => {
            console.error(
              `Error processing segment ${index + 1}: ${err.message}`
            );
            reject(`Error processing segment ${index + 1}: ${err.message}`);
          })
          .save(outputFilePath);
      });

      promises.push(promise);
    });

    resolve({
      promises,
      temporalVideoPath: videoPathWithFormat,
    });
  });
};

// captureAndCutVideoMarcosPromises(
//   "C:/Users/aaron/Downloads/result/Recorré el mundo en 1 minuto IMPRESIONANTE VIDEO.mp4",
//   [
//     { start: "00:00:00", end: "00:00:06" },
//     { start: "00:00:10", end: "00:00:15" },
//   ],
//   "C:/Users/aaron/Downloads/result"
// );

// Promises
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

    const outputDirectory = outputFile;

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

export default captureAndCutVideoMarcosPromises;
