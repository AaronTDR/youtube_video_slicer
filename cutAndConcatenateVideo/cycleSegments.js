import path from "path";
import { config } from "../config.js";

import extractSegments from "./extractSegments.js";
import {
  execP,
  updateUrlsWithPaths,
  processInBatches,
  getSeconds,
  getExtension,
  equalStrings,
  getResolutions,
} from "../utils/functions.js";

const { ffprobe_exe_path, workingFolderPath, timestamps, concurrencyLimit } =
  config;

const cycleSegments = async () => {
  // Replaces all "url" properties of timestamp objects with the "path" property to maintain consistency across object types
  const timestampsWithPaths = updateUrlsWithPaths(
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
  }

  const sortableDate = new Date().toISOString().replace(/[:.]/g, "_");

  const segmentPromises = [];

  for (const timestamp of timestampsWithPaths) {
    const extension = path.extname(timestamp.path);

    try {
      const command = `${config.ffprobe_exe_path} -loglevel error -select_streams v:0 -show_entries packet=pts_time,flags -of csv=print_section=0 ${timestamp.path}`;

      const result = await execP(command, { maxBuffer: 1048576000 });
      const keyframes = [];

      result.stdout.split(/\r?\n/).forEach((keyframe) => {
        if (keyframe.includes("K_")) {
          keyframes.push(parseFloat(keyframe.replace(",K__", "")));
        }
      });

      const timestampsInSeconds = {
        start: getSeconds(timestamp.start),
        end: getSeconds(timestamp.end),
      };

      const { file, commands } = await extractSegments(
        timestamp.path,
        timestampsInSeconds,
        keyframes,
        extension,
        sortableDate
      );

      segmentPromises.push({ file, commands });
    } catch (error) {
      console.error(
        `Error processing timestamp ${JSON.stringify(timestamp)}:`,
        error
      );
    }
  }

  console.log(`Total segments prepared: ${segmentPromises.length}`);

  const allCommands = segmentPromises.flatMap((segment) => segment.commands);
  await processInBatches(allCommands, concurrencyLimit);

  return segmentPromises.map((segment) => segment.file);
};

export default cycleSegments;
