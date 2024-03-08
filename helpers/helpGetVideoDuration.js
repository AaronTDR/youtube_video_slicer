import cp from "child_process";

const helpGetVideoDuration = (url) => {
  return new Promise((resolve, reject) => {
    const ytDlpProcess = cp.spawn("yt-dlp", ["--get-duration", url]);

    ytDlpProcess.stdout.on("data", (data) => {
      // Video duration
      const duration = data.toString().trim();
      resolve(duration);
    });

    ytDlpProcess.stderr.on("data", (error) => {
      console.error(`Error getting duration: ${error}`);
      reject();
    });

    ytDlpProcess.on("close", (code) => {
      console.log(`yt-dlp --get-duration ended with exit code: ${code}`);
    });
  });
};

export default helpGetVideoDuration;
