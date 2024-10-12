import fs from "fs";
import { promisify } from "util";
import { exec } from "child_process";

const execP = promisify(exec);

const ffmpeg = "ffmpeg";
const workingFolderPath = "C:/users/aaron/downloads/result/";
const segmentsFolderPath = "C:/users/aaron/downloads/result//segments/";
const fileName = "The_Fore_OrtoE1rAoIw";
const fileExtension = ".webm";
const fullPathVideo = `${workingFolderPath}${fileName}${fileExtension}`;
const ffprobe_exe_path = "ffprobe";

const timestamps = [
  { start: "00:00:16", end: "00:00:19" },
  { start: "00:00:25", end: "00:00:31" },
  { start: "00:00:33", end: "00:00:35" },
];

const getSeconds = (timestamp) => {
  const [hours, minutes, seconds] = timestamp.split(":").map(Number);

  // Validate hours, minutes, and seconds
  if (
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59 ||
    seconds < 0 ||
    seconds > 59
  ) {
    throw new RangeError(
      "Invalid timestamp format. Hours, minutes, or seconds exceed valid ranges."
    );
  }
  return hours * 3600 + minutes * 60 + seconds;
};

const timestampsInSeconds = timestamps.map((ts) => {
  return { start: getSeconds(ts.start), end: getSeconds(ts.end) };
});

async function main() {
  try {
    const command =
      `${ffprobe_exe_path} -loglevel error -select_streams v:0 -show_entries packet=pts_time,flags -of csv=print_section=0 ` +
      `${fullPathVideo} ` +
      ``;

    // console.log("command: ", command);

    const result = await execP(command, { maxBuffer: 1048576000 });
    const keyframes = [];
    console.log("🚀 ~ main ~ keyframes:", keyframes);

    result.stdout.split("\r\n").forEach((keyframe) => {
      if (keyframe.includes("K_")) {
        keyframes.push(parseFloat(keyframe.replace(",K__", "")));
      }
    });
    let file = ``;
    const ffmpegCommandsToRun = [];
    timestampsInSeconds.forEach((ts, index) => {
      const inBetweenKeyFrames = keyframes.filter((kf, idx) => {
        if (ts.start <= kf && ts.end >= kf) {
          return kf;
        }
      });

      const dotTo_ = (float) => float.toString().replace(/\./g, "_");
      const prefix = "segment_000000";

      // no keyframes in between start and end
      if (inBetweenKeyFrames.length <= 1) {
        const videoSegmentName = `${segmentsFolderPath}${prefix}${index + 1}${
          ts.start
        }-${ts.end}${fileExtension}`;
        file += `file '${videoSegmentName}'\n`;
        ffmpegCommandsToRun.push(
          `${ffmpeg} -i ${fullPathVideo} -ss ${ts.start} -to ${ts.end} ${videoSegmentName}`
        );
      } else {
        const [firstKeyframe] = inBetweenKeyFrames;
        const lastKeyframe = inBetweenKeyFrames[inBetweenKeyFrames.length - 1];
        const videoSegmentNameBeginning = `${segmentsFolderPath}${prefix}${
          index + 1
        }${ts.start}-${dotTo_(firstKeyframe)}${fileExtension}`;
        ffmpegCommandsToRun.push(
          `${ffmpeg} -i ${fullPathVideo} -ss ${ts.start} -to ${firstKeyframe} ${videoSegmentNameBeginning}`
        );
        file += `file '${videoSegmentNameBeginning}'\n`;
        file += `file '${fullPathVideo}'\n`;
        file += `inpoint ${firstKeyframe}\n`;
        file += `outpoint ${lastKeyframe}\n`;

        const videoSegmentNameEnd = `${segmentsFolderPath}${prefix}${
          index + 1
        }${dotTo_(lastKeyframe)}-${ts.end}${fileExtension}`;
        ffmpegCommandsToRun.push(
          `${ffmpeg} -i ${fullPathVideo} -ss ${lastKeyframe} -to ${ts.end} ${videoSegmentNameEnd}`
        );
        file += `file '${videoSegmentNameEnd}'\n`;
        console.log("🚀 ~ timestampsInSeconds.forEach ~ file:", file);
      }
    });

    const concurrentCommandsToExecuted = 2;
    while (ffmpegCommandsToRun.length !== 0) {
      try {
        const chunkCommandsToProcess = ffmpegCommandsToRun.splice(
          0,
          concurrentCommandsToExecuted
        );
        const chunkCommandsToProcessPromises = chunkCommandsToProcess.map(
          (ffmpegCommand) => {
            console.log("command: ", ffmpegCommand);
            return execP(ffmpegCommand);
          }
        );
        await Promise.all(chunkCommandsToProcessPromises);
        console.log(`Batch processed\n`);
      } catch (error) {
        console.log("Batch error: ", error);
      }
    }

    // console.log('FILE: \n', file);
    // console.log('ffmpegCommandsToRun: ', ffmpegCommandsToRun);

    try {
      const fileConcatFullPath = workingFolderPath + "concatfile.txt";
      fs.writeFileSync(fileConcatFullPath, file);

      const fileNameOutput = "final_result";
      const fullPathOutputVideo = `${workingFolderPath}${fileNameOutput}${fileExtension}`;

      const command = `${ffmpeg} -f concat -safe 0 -i ${fileConcatFullPath} -c copy ${fullPathOutputVideo}`;
      console.log("command: ", command);
      console.log(`File concatenated\n`);
      return await execP(command);
    } catch (error) {
      console.log("File concat error: ", error);
    }
  } catch (error) {
    console.log("error: ", error);
  }
  console.log("------------------");
  console.log("\nDone");
}

main();
