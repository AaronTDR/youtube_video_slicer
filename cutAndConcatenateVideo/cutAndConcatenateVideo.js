import fs from "fs";
import { promisify } from "util";
import { exec } from "child_process";
import { processInBatches, getSeconds } from "../utils/functions.js";

const execP = promisify(exec);

async function cutAndConcatenateVideo(
  ffmpeg_exe_path,
  ffprobe_exe_path,
  title,
  workingFolderPath,
  segmentsFolderPath,
  timestamps,
  temporalVideoName,
  fileExtension,
  concurrencyLimit
) {
  const fullPathVideo = `${workingFolderPath}${temporalVideoName}${fileExtension}`;

  // Convert timestamps to seconds with milliseconds
  const timestampsInSeconds = timestamps.map((ts) => ({
    start: getSeconds(ts.start),
    end: getSeconds(ts.end),
  }));

  // Remove invalid characters for Windows
  const sortableDate = new Date().toISOString().replace(/[:.]/g, "_");

  try {
    const command = `${ffprobe_exe_path} -loglevel error -select_streams v:0 -show_entries packet=pts_time,flags -of csv=print_section=0 ${fullPathVideo}`;
    console.log("Command Keyframes: ", command);

    const result = await execP(command, { maxBuffer: 1048576000 });
    const keyframes = [];

    // Handle different newline characters
    result.stdout.split(/\r?\n/).forEach((keyframe) => {
      if (keyframe.includes("K_")) {
        keyframes.push(parseFloat(keyframe.replace(",K__", "")));
      }
    });

    let file = ``;
    const ffmpegCommandsToRun = [];
    let optimizationsFound = 0;

    timestampsInSeconds.forEach((ts, index) => {
      const inBetweenKeyFrames = keyframes.filter(
        (kf) => ts.start < kf && ts.end > kf
      );

      const dotTo_ = (float) => float.toString().replace(/\./g, "_");
      const prefix = `${sortableDate}_segment_000000`;

      if (inBetweenKeyFrames.length <= 1) {
        // Replace `:` with `_` in the output filenames
        const videoSegmentName = `${segmentsFolderPath}${prefix}${index + 1}${
          ts.start
        }-${ts.end.toString().replace(/[:]/g, "_")}${fileExtension}`;
        file += `file '${videoSegmentName}'\n`;
        ffmpegCommandsToRun.push(() =>
          execP(
            `${ffmpeg_exe_path} -i ${fullPathVideo} -ss ${formatFFmpegTime(
              ts.start
            )} -to ${formatFFmpegTime(ts.end)} ${videoSegmentName}`
          )
        );
      } else {
        optimizationsFound++;
        const [firstKeyframe] = inBetweenKeyFrames;
        const lastKeyframe = inBetweenKeyFrames[inBetweenKeyFrames.length - 1];
        const videoSegmentNameBeginning = `${segmentsFolderPath}${prefix}${
          index + 1
        }${ts.start}-${dotTo_(firstKeyframe)}${fileExtension}`;

        ffmpegCommandsToRun.push(() =>
          execP(
            `${ffmpeg_exe_path} -i ${fullPathVideo} -ss ${formatFFmpegTime(
              ts.start
            )} -to ${formatFFmpegTime(
              firstKeyframe
            )} ${videoSegmentNameBeginning}`
          )
        );
        file += `file '${videoSegmentNameBeginning}'\n`;
        file += `file '${fullPathVideo}'\n`;
        file += `inpoint ${firstKeyframe}\n`;
        file += `outpoint ${lastKeyframe}\n`;

        const videoSegmentNameEnd = `${segmentsFolderPath}${prefix}${
          index + 1
        }${dotTo_(lastKeyframe)}-${formatFFmpegTime(ts.end)
          .toString()
          .replace(/[:]/g, "_")}${fileExtension}`;
        ffmpegCommandsToRun.push(() =>
          execP(
            `${ffmpeg_exe_path} -i ${fullPathVideo} -ss ${formatFFmpegTime(
              lastKeyframe
            )} -to ${formatFFmpegTime(ts.end)} ${videoSegmentNameEnd}`
          )
        );
        file += `file '${videoSegmentNameEnd}'\n`;
      }
    });

    console.log("Optimizations found: ", optimizationsFound);
    await processInBatches(ffmpegCommandsToRun, concurrencyLimit);

    try {
      const fileConcatFullPath = `${workingFolderPath}concatfile.txt`;
      fs.writeFileSync(fileConcatFullPath, file);

      const fileNameOutput = `${sortableDate}_final_result_${temporalVideoName}`;
      const fullPathOutputVideo = `${workingFolderPath}${fileNameOutput}${fileExtension}`;
      const concatCommand = `${ffmpeg_exe_path} -f concat -safe 0 -i ${fileConcatFullPath} -c copy ${fullPathOutputVideo}`;
      console.log("command: ", concatCommand);
      await execP(concatCommand);
      console.log("Concatenated file name: ", fullPathOutputVideo);
      return { fileNameOutputWithoutExtension: fileNameOutput, fileExtension };
    } catch (error) {
      console.error("File concat error: ", error);
    }
  } catch (error) {
    console.error("Error executing ffprobe or ffmpeg: ", error);
  }
  console.log("------------------");
  console.log("\nDone");
}

// Improved helper function for FFmpeg time format
const formatFFmpegTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = (seconds % 60).toFixed(3);
  return [hours, minutes, secs]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
};

export default cutAndConcatenateVideo;
