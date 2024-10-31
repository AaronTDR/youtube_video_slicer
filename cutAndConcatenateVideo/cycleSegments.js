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

  // Check if all extensions and resolutions are identical before continuing with the execution
  if (timestampsWithPaths.length > 1) {
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
    const resultExtensions = equalStrings(extensions);
    const resultResolutions = equalStrings(resolutions);

    if (!resultExtensions) {
      throw new Error(
        "The extensions are not equal. At this time different video formats of the selected videos are not supported."
      );
    }
    if (!resultResolutions) {
      throw new Error(
        "The resolutions are not equal. At this time different resolutions in videos are not supported."
      );
    }

    const targetFormat = extensions[0];
    // Updates the target format once all formats are confirmed to be the same
    setTargetExtension(targetFormat);
  }

  const sortableDate = new Date().toISOString().replace(/[:.]/g, "_");

  // Process timestamps in batches
  const processTimestampBatch = async (batch) => {
    return await Promise.all(
      batch.map((timestamp) => processTimestamp(timestamp, sortableDate))
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
