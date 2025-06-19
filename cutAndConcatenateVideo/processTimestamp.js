import path from "path";
import extractSegments from "./extractSegments.js";
import { execP, getSeconds } from "../utils/functions.js";
import { config } from "../config.js";

const { ffprobe_exe_path } = config;

const processTimestamp = async (timestamp, sortableDate, shouldAvoidOptimizations) => {
  const extension = path.extname(timestamp.path);
  try {
    /**
     * If shouldAvoidOptimizations is true, we don't even bother to get the keyframes from
     * the video, since we won't even use them later in the script.
     */
    if (shouldAvoidOptimizations) {
      const timestampsInSeconds = {
        start: getSeconds(timestamp.start),
        end: getSeconds(timestamp.end),
      };

      const { file, commands } = await extractSegments(
        timestamp.path,
        timestampsInSeconds,
        [],
        extension,
        sortableDate,
        shouldAvoidOptimizations
      );

      return { file, commands };
    } else {
      const command = `${ffprobe_exe_path} -loglevel error -select_streams v:0 -show_entries packet=pts_time,flags -of csv=print_section=0 "${timestamp.path}"`;
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
        sortableDate,
        shouldAvoidOptimizations
      );

      return { file, commands };
    }

  } catch (error) {
    console.error(
      `Error processing timestamp ${JSON.stringify(timestamp)}:`,
      error
    );
    return null;
  }
};

export default processTimestamp;
