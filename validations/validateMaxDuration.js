import helpGetVideoDuration from "../helpers/helpGetVideoDuration.js";
import { formatTime, getSeconds } from "../utils/functions.js";

const validateMaxDuration = async (videoUrl, timestamps) => {
  try {
    // Get video duration
    const videoDuration = await helpGetVideoDuration(videoUrl);

    if (videoDuration) {
      // Gets the time in format HH:MM:SS
      const videoDurationFormatted = formatTime(videoDuration);

      const videoDurationSeconds = getSeconds(videoDurationFormatted);

      for (const [index, timestamp] of timestamps.entries()) {
        const endInSeconds = getSeconds(timestamp.end);

        // One more second is added for margin of error, this is because there is a margin of one second in the time returned by the '--get-duration' option at helpGetVideoDuration
        if (endInSeconds > videoDurationSeconds + 1) {
          throw new RangeError(
            `Error at validateMaxDuration function, timestamp: (${timestamp.start} - ${timestamp.end}), index: ${index}, exceeds the duration of the video: (${videoDuration})`
          );
        }
      }
    } else {
      console.warn(
        "Could not get video duration, this may lead to unexpected behavior, as a possible solution try updating to the latest version of yt-dlp. You can use: 'yt-dlp -U' to update."
      );
    }
  } catch (error) {
    throw error;
  }
};

export default validateMaxDuration;
