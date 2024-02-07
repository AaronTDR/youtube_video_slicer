// Function to convert a timestamp to seconds
const getSeconds = (timestamp) => {
  const [hours, minutes, seconds] = timestamp.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

// Function to convert seconds to timestamp
const secondsToTimestamp = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const resultingSeconds = seconds % 60;

  // Format timestamp
  const format = (value) => (value < 10 ? `0${value}` : `${value}`);

  return `${format(hours)}:${format(minutes)}:${format(resultingSeconds)}`;
};

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
