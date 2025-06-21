
import { config } from "../config.js";

function timeToSeconds(timeStr) {
  const [hh, mm, ss] = timeStr.split(":");
  return parseInt(hh) * 3600 + parseInt(mm) * 60 + parseFloat(ss);
}

const totalSeconds = config.timestamps.reduce((sum, { start, end }) => {
  return sum + (timeToSeconds(end) - timeToSeconds(start));
}, 0);

const totalMinutes = totalSeconds / 60;

console.log("\n\nRESULTING VIDEO DURATION IN MINUTES: ", totalMinutes.toFixed(2), '\n');
