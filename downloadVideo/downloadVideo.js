import cp from "child_process";

import getExtension from "./getExtension.js";

const downloadVideoYtDlp = (url, outputDirectory) => {
  // 'temporalVideoName' is the temporary name for the original video from which the timestamps will be obtained, once this is done this video will be deleted.
  const temporalVideoName = new Date().getTime().toString();

  const ytDlpProcess = cp.spawn("yt-dlp", [
    "--progress",
    "--output",
    `${outputDirectory}${temporalVideoName}.%(ext)s`,
    url,
  ]);

  ytDlpProcess.stdout.pipe(process.stdout); // Redirect progress to console

  const ytDlpProcessPromise = new Promise((resolve, reject) => {
    ytDlpProcess.on("close", (code) => {
      if (code === 0) {
        console.log("Video downloaded successfully");
        // Get extension file
        const videoExtension = getExtension(outputDirectory, temporalVideoName);

        resolve({ temporalVideoName, videoExtension });
      } else {
        console.error("Error downloading video with yt-dlp:", code);
        reject(`Error downloading video (code ${code})`);
      }
      ytDlpProcess.removeAllListeners(); // Remove listeners after resolution
    });

    ytDlpProcess.on("error", (err) => {
      console.error("Error starting yt-dlp process:", err);
      reject("Error starting yt-dlp process");
      ytDlpProcess.removeAllListeners(); // Remove listeners after rejection
    });
  });

  return ytDlpProcessPromise;
};

export default downloadVideoYtDlp;
