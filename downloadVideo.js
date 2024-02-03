import fs from "fs";
import ytdl from "ytdl-core";
import cp from "child_process";
import ffmpegPath from "ffmpeg-static";
import path from "path";

const downloadVideo = async (url, outputDirectory) => {
  return new Promise(async (resolve, reject) => {
    // Check if the output directory exists
    if (!fs.existsSync(outputDirectory)) {
      reject("Output directory does not exist");
      return;
    }

    const info = await ytdl.getBasicInfo(url);
    const videoTitle = info.videoDetails.title;
    const pathWithTitle = path.join(outputDirectory, videoTitle);

    const tracker = {
      start: Date.now(),
      audio: { downloaded: 0, total: Infinity },
      video: { downloaded: 0, total: Infinity },
      merged: { frame: 0, speed: "0x", fps: 0 },
    };

    const audio = ytdl(url, { quality: "highestaudio" }).on(
      "progress",
      (_, downloaded, total) => {
        tracker.audio = { downloaded, total };
      }
    );
    const video = ytdl(url, { quality: "highestvideo" }).on(
      "progress",
      (_, downloaded, total) => {
        tracker.video = { downloaded, total };
      }
    );

    let progressbarHandle = null;
    const progressbarInterval = 1000;

    // show progress
    /* const showProgress = () => {
      readline.cursorTo(process.stdout, 0);
      const toMB = (i) => (i / 1024 / 1024).toFixed(2);

      process.stdout.write(
        `Audio  | ${(
          (tracker.audio.downloaded / tracker.audio.total) *
          100
        ).toFixed(2)}% processed `
      );
      process.stdout.write(
        `(${toMB(tracker.audio.downloaded)}MB of ${toMB(
          tracker.audio.total
        )}MB).${" ".repeat(10)}\n`
      );

      process.stdout.write(
        `Video  | ${(
          (tracker.video.downloaded / tracker.video.total) *
          100
        ).toFixed(2)}% processed `
      );
      process.stdout.write(
        `(${toMB(tracker.video.downloaded)}MB of ${toMB(
          tracker.video.total
        )}MB).${" ".repeat(10)}\n`
      );

      process.stdout.write(
        `Merged | processing frame ${tracker.merged.frame} `
      );
      process.stdout.write(
        `(at ${tracker.merged.fps} fps => ${tracker.merged.speed}).${" ".repeat(
          10
        )}\n`
      );

      process.stdout.write(
        `running for: ${((Date.now() - tracker.start) / 1000 / 60).toFixed(
          2
        )} Minutes.`
      );
      readline.moveCursor(process.stdout, 0, -3);
    }; */

    // Start the ffmpeg child process
    const ffmpegProcess = cp.spawn(
      ffmpegPath,
      [
        "-loglevel",
        "8",
        "-hide_banner",
        "-progress",
        "pipe:3",
        "-i",
        "pipe:4",
        "-i",
        "pipe:5",
        "-map",
        "0:a",
        "-map",
        "1:v",
        "-c:v",
        "copy",
        `${pathWithTitle}.mp4`,
      ],
      {
        windowsHide: true,
        stdio: ["inherit", "inherit", "inherit", "pipe", "pipe", "pipe"],
      }
    );

    ffmpegProcess.on("close", () => {
      console.log("done");
      clearInterval(progressbarHandle);

      resolve("Download and processing completed successfully");
    });

    ffmpegProcess.stdio[3].on("data", (chunk) => {
      if (!progressbarHandle)
        progressbarHandle = setInterval(showProgress, progressbarInterval);
      const lines = chunk.toString().trim().split("\n");
      const args = {};
      for (const l of lines) {
        const [key, value] = l.split("=");
        args[key.trim()] = value.trim();
      }
      tracker.merged = args;
    });

    audio.pipe(ffmpegProcess.stdio[4]);
    video.pipe(ffmpegProcess.stdio[5]);
  });
};

export default downloadVideo;
