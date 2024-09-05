import path from "path";
import cp from "child_process";

import subtractTimestamps from "./subtractTimestamps.js";

// Helper function to run promises in batches
const processInBatches = async (tasks, limit) => {
  try {
    const results = [];
    const executing = new Set();

    for (const task of tasks) {
      const p = task().then((result) => {
        executing.delete(p);
        return result;
      });
      results.push(p);
      executing.add(p);

      if (executing.size >= limit) {
        await Promise.race(executing);
      }
    }

    return Promise.all(results);
  } catch (error) {
    console.error(error);
  }
};

const captureAndCutVideo = async (
  inputVideoDirectory,
  timestamps,
  temporalVideoName,
  videoFormat,
  outputDirectory,
  concurrencyLimit = 5 // Limit of concurrent tasks
) => {
  const videoPath = path.join(inputVideoDirectory, temporalVideoName);
  const videoPathWithFormat = `${videoPath}${videoFormat}`;
  const tasks = [];

  timestamps.forEach((timestamp, index) => {
    const { start, end } = timestamp;
    const outputFileName =
      new Date().toISOString().replace(/:/g, "-") +
      `_segment_${index + 1}${videoFormat}`;
    const outputFilePath = path.join(outputDirectory, outputFileName);

    const durationClip = subtractTimestamps(end, start);

    // Create task as a function to defer its execution
    const task = () =>
      new Promise((resolve, reject) => {
        const ffmpegProcess = cp.spawn("ffmpeg", [
          "-i",
          videoPathWithFormat,
          "-ss",
          start, // Start time
          "-t",
          durationClip, // clip duration
          "-preset",
          "veryfast", // Preset to speed up encoding
          "-crf",
          "23", // Quality: 0 is lossless, 23 is good quality, 51 is the lowest
          outputFilePath, // Output file
        ]);

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

    tasks.push(task);
  });

  // Process tasks in batches with concurrency limit
  await processInBatches(tasks, concurrencyLimit);

  return {
    temporalVideoPath: videoPathWithFormat,
  };
};

export default captureAndCutVideo;
