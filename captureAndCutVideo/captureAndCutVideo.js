import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

import path from "path";

import validateTimestamps from "./validateTimestamps.js";
import subtractTimestamps from "./subtractTimestamps.js";

const captureAndCutVideo = (
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

export default captureAndCutVideo;
