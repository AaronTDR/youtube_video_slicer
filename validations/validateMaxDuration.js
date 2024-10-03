import helpGetVideoDuration from "../helpers/helpGetVideoDuration.js";
import { formatTime, getSeconds } from "../utils/functions.js";

const validateMaxDuration = async (videoUrl, timestamps) => {
  try {
    const videoDuration = await helpGetVideoDuration(videoUrl);

    if (videoDuration) {
      const videoDurationFormatted = formatTime(videoDuration);
      const videoDurationSeconds = getSeconds(videoDurationFormatted);

      for (const [index, timestamp] of timestamps.entries()) {
        const endInSeconds = getSeconds(timestamp.end);

        if (endInSeconds > videoDurationSeconds + 1) {
          throw new RangeError(
            `Error at validateMaxDuration function, timestamp: (${timestamp.start} - ${timestamp.end}), index: ${index}, exceeds the duration of the video: (${videoDuration})`
          );
        }
      }
    } else {
      console.warn(
        "Could not get video duration, this may lead to unexpected behavior. Update yt-dlp as a possible solution."
      );
    }
  } catch (error) {
    throw error;
  }
};

export default validateMaxDuration;
