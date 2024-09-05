import path from "path";
import cp from "child_process";

import subtractTimestamps from "./subtractTimestamps.js";

const captureAndCutVideo = async (
  inputVideoDirectory,
  timestamps,
  temporalVideoName,
  videoFormat,
  outputDirectory
) => {
  const videoPath = path.join(inputVideoDirectory, temporalVideoName);
  const videoPathWithFormat = `${videoPath}${videoFormat}`;
  const promises = [];

  timestamps.forEach((timestamp, index) => {
    const { start, end } = timestamp;
    const outputFileName =
      new Date().toISOString().replace(/:/g, "-") +
      `_segment_${index + 1}${videoFormat}`;
    const outputFilePath = path.join(outputDirectory, outputFileName);

    const durationClip = subtractTimestamps(end, start);

    const ffmpegProcess = cp.spawn("ffmpeg", [
      "-i",
      videoPathWithFormat,
      "-ss",
      start, // Start time
      "-t",
      durationClip, // clip duration
      // Lightweight recoding
      "-preset",
      "veryfast", // Preset to speed up encoding
      "-crf",
      "23", // Quality: 0 is lossless, 23 is good quality, 51 is the lowest
      outputFilePath, // Output file
    ]);

    const promise = new Promise((resolve, reject) => {
      ffmpegProcess.on("close", (code) => {
        if (code === 0) {
          console.log(`Segment ${index + 1} saved: ${outputFileName}`);
          resolve();
        } else {
          const errorMessage = `Error processing segment ${
            index + 1
          }. Exit code: ${code}`;
          console.error(errorMessage);
          reject(errorMessage);
        }
      });
    });

    promises.push(promise);
  });

  await Promise.all(promises);

  return {
    temporalVideoPath: videoPathWithFormat,
  };
};

export default captureAndCutVideo;
