import processTimestamp from "./processTimestamp.js";
import { config } from "../config.js";
import {
  execP,
  updateUrlsWithPaths,
  processInBatches,
  getExtension,
  equalStrings,
  getResolutions,
} from "../utils/functions.js";

import { setTargetExtension } from "../extension.js";

const { ffprobe_exe_path, workingFolderPath, timestamps, concurrencyLimit } =
  config;

const cycleSegments = async () => {
  // Replaces all "url" properties of timestamp objects with the "path" property to maintain consistency across object types
  const timestampsWithPaths = await updateUrlsWithPaths(
    workingFolderPath,
    timestamps
  );

  // Get extensions
  const extensions = timestampsWithPaths.map((timestamp) =>
    getExtension(timestamp.path)
  );
  // Get resolutions
  const resolutions = await getResolutions(
    timestampsWithPaths,
    ffprobe_exe_path,
    execP
  );
  const resultResolutions = equalStrings(resolutions);

  if (!resultResolutions) {
    throw new Error(
      "The resolutions are not equal. At this time different resolutions in videos are not supported."
    );
  }

  /**
   * We now support videos with different extensions.
   *
   * For example, if we download two videos from Youtube, one is a .mp4
   * and another one is .mkv, we allow that but we won't try to optimize
   * the video cuts with keyframes. It will be the slower approach where
   * each segment is fully encoded to .mp4 so that the resulting segments
   * are all .mp4 x264 and we can concatenate them easily.
   */
  const containsMP4 = extensions.includes('.mp4');
  const shouldAvoidOptimizations = containsMP4 || !extensions.every(extension => extension === extensions[0]);
  console.log('\n\n------>shouldAvoidOptimizations: ', shouldAvoidOptimizations, '\n\n');

  let targetFormat;
  if (shouldAvoidOptimizations) {
    targetFormat = '.mp4';
    setTargetExtension(targetFormat);
  } else {
    targetFormat = extensions[0];
    setTargetExtension(targetFormat);
  }


  const sortableDate = new Date().toISOString().replace(/[:.]/g, "_");

  // Process timestamps in batches
  const processTimestampBatch = async (batch) => {
    return await Promise.all(
      batch.map((timestamp) => processTimestamp(timestamp, sortableDate, shouldAvoidOptimizations))
    );
  };

  // Split timestamps into batches
  const batches = [];
  for (let i = 0; i < timestampsWithPaths.length; i += concurrencyLimit) {
    batches.push(timestampsWithPaths.slice(i, i + concurrencyLimit));
  }

  // Process all batches sequentially
  const results = [];
  for (const batch of batches) {
    const batchResults = await processTimestampBatch(batch);
    results.push(...batchResults.filter((result) => result !== null));
  }

  console.log(`Total segments prepared: ${results.length}`);

  // Process all commands
  const allCommands = results.flatMap((segment) => segment.commands);
  await processInBatches(allCommands, concurrencyLimit);

  return results.map((segment) => segment.file);
};

export default cycleSegments;
