import cp from "child_process";
import fs from "fs";
import path from "path";
import helpGetVideoTitle from "../helpers/helpGetVideoTitle.js";

import { getIdFromUrl } from "../utils/functions.js";

// Clean video title
const sanitizeTitle = (title) => {
  return title.replace(/[^\p{L}\p{N}-]/gu, "_").substring(0, 8); // Clean illegal characters and truncate to 8 characters
};

const downloadVideoYtDlp = async (url, workingFolderPath) => {
  // Extract video ID from URL
  const videoId = getIdFromUrl(url);
  if (!videoId) {
    console.error("Failed to extract video ID from URL.");
    return;
  }

  // Get the title of the video
  const videoTitle = await helpGetVideoTitle(url);
  const sanitizedTitle = sanitizeTitle(videoTitle);

  // Generate final file name (without extension)
  const videoFileName = `${sanitizedTitle}_${videoId}`;
  const videoFilePath = path.join(workingFolderPath, `${videoFileName}`);

  // Check if the file already exists
  const files = fs.readdirSync(workingFolderPath);

  const exist = files.some((file) => {
    return path.parse(file).name === videoFileName;
  });

  if (exist) {
    console.log(`The video already exists: ${videoFileName}`);
    return; // Do nothing if file already exists
  }

  console.log(
    `The video does not exist. Proceeding to download: ${videoFileName}`
  );

  // Start the download process with yt-dlp (the format will be inferred)
  const ytDlpProcess = cp.spawn("yt-dlp", [
    "--progress",
    "--output",
    `${videoFilePath}.%(ext)s`, // yt-dlp will determine the extension automatically
    url,
  ]);

  ytDlpProcess.stdout.pipe(process.stdout); // Redirect progress to the console

  // Wait for the download process to finish
  const ytDlpProcessPromise = new Promise((resolve, reject) => {
    ytDlpProcess.on("close", (code) => {
      if (code === 0) {
        console.log(`Video downloaded and saved as: ${videoFilePath}`);
        resolve({ videoFileName });
      } else {
        console.error("Error downloading video with yt-dlp:", code);
        reject(`Error downloading video (code ${code})`);
      }
      ytDlpProcess.removeAllListeners(); // Remove listeners after resolving
    });

    ytDlpProcess.on("error", (err) => {
      console.error("Error starting yt-dlp process:", err);
      reject("Error starting yt-dlp process");
      ytDlpProcess.removeAllListeners(); // Delete listeners after rejecting
    });
  });

  return ytDlpProcessPromise;
};

export default downloadVideoYtDlp;
