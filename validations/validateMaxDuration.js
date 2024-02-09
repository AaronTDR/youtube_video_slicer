import helpGetVideoDuration from "../helpers/helpGetVideoDuration.js";
import { formatTime, getSeconds } from "../utils/functions.js";

const validateMaxDuration = async (videoUrl, timestamps) => {
  try {
    // Get video duration
    const videoDuration = await helpGetVideoDuration(videoUrl);
    let validated = false;

    // Gets the time in format HH:MM:SS
    const videoDurationFormatted = formatTime(videoDuration);

    const videoDurationSeconds = getSeconds(videoDurationFormatted);

    for (const timestamp of timestamps) {
      const endInSeconds = getSeconds(timestamp.end);

      // One more second is added for margin of error
      if (endInSeconds > videoDurationSeconds + 1) {
        validated = true;
        console.log(
          `Timestamp (${timestamp.start} - ${timestamp.end}) exceeds the duration of the video: (${videoDuration})`
        );
      }
    }
    return validated;
  } catch (error) {
    console.log(error);
  }
};

export default validateMaxDuration;
