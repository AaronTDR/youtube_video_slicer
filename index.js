import concatenateVideos from "./concatenateVideos.js";
import captureAndCutVideo from "./captureAndCutVideo.js";
import downloadVideo from "./downloadVideo.js";

const url = "https://www.youtube.com/watch?v=K1gHajTNDTE";
const timestamps = [
  { start: "00:00:00", end: "00:00:06" },
  { start: "00:00:10", end: "00:00:15" },
  /*{ start: "00:00:00", end: "00:04:10" },
  { start: "00:05:30", end: "00:06:00" },
  { start: "00:10:00", end: "00:10:50" }, */
];
const outputFile = "C:/Users/aaron/Downloads/result";

const ytConcatenateSlices = (videoUrl, timestamps, outputFile) => {
  downloadVideo(videoUrl, outputFile)
    .then((result) => {
      return captureAndCutVideo(outputFile, timestamps, outputFile);
    })
    .then((result) => {
      return concatenateVideos(outputFile);
    })
    .then((concatenatedVideo) => {
      console.log(`Concatenated video: ${concatenatedVideo}`);
    })
    .catch((error) => {
      console.error(error);
    });
};

ytConcatenateSlices(url, timestamps, outputFile);
