import path from "path";
import execP from "./execP.js";
import { config } from "../config.js";

import extractSegments from "./extractSegments.js";
import {
  updateUrlsWithPaths,
  processInBatches,
  getSeconds,
} from "../utils/functions.js";

const { workingFolderPath, timestamps, concurrencyLimit } = config;

const cycleSegments = async () => {
  const timestampsWithPaths = updateUrlsWithPaths(
    workingFolderPath,
    timestamps
  );

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
