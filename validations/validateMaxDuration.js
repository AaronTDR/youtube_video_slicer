import helpGetVideoDuration from "../helpers/helpGetVideoDuration.js";
import {
  getVideoDurationFile,
  formatTime,
  getSeconds,
} from "../utils/functions.js";
import { config } from "../config.js";

const { ffprobe_exe_path } = config;

const validateMaxDuration = async (timestamp, index) => {
  const endInSeconds = getSeconds(timestamp.end);
  if (timestamp.url && !timestamp.path) {
    const videoDuration = await helpGetVideoDuration(timestamp.url);
    if (videoDuration) {
      const videoDurationFormatted = formatTime(videoDuration);
      const videoDurationSeconds = getSeconds(videoDurationFormatted);
      if (endInSeconds > videoDurationSeconds + 1) {
        throw new RangeError(
          `Error at validateMaxDuration function, timestamp: (${timestamp.start} - ${timestamp.end}), index: ${index}, exceeds the duration of the video: (${videoDuration})`
        );
      }
    } else {
      console.warn(
        "Could not get video duration, this may lead to unexpected behavior. Update yt-dlp as a possible solution."
      );
    }
  } else if (timestamp.path && !timestamp.url) {
    const videoDurationSeconds = await getVideoDurationFile(
      ffprobe_exe_path,
      timestamp.path
    );
    if (videoDurationSeconds) {
      if (endInSeconds > videoDurationSeconds) {
        throw new RangeError(
          `Error at validateMaxDuration function, timestamp: (${timestamp.start} - ${timestamp.end}), index: ${index}, exceeds the duration of the video: (${videoDurationSeconds})`
        );
      }
    }
  }
};

export default validateMaxDuration;
