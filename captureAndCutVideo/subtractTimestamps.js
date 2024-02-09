import { getSeconds, secondsToTimestamp } from "../utils/functions.js";

const subtractTimestamps = (time1, time2) => {
  // Convert timestamps to seconds
  const seconds1 = getSeconds(time1);
  const seconds2 = getSeconds(time2);

  // Calculate the difference in seconds
  const differenceSeconds = seconds1 - seconds2;

  // Convert difference back to timestamp format
  const result = secondsToTimestamp(differenceSeconds);

  return result;
};

export default subtractTimestamps;
