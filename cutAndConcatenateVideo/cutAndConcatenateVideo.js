import fs from "fs";
import { promisify } from "util";
import { exec } from "child_process";

// import { getSeconds } from "../utils/functions.js";
import { processInBatches } from "../utils/functions.js";

const execP = promisify(exec);

async function cutAndConcatenateVideo(
  ffmpeg_exe_path,
  ffprobe_exe_path,
  title,
  workingFolderPath,
  segmentsFolderPath,
  timestamps,
  temporalVideoName,
  fileExtension
) {
  const fullPathVideo = `${workingFolderPath}${temporalVideoName}${fileExtension}`;

  const getSeconds = (timestamp) => {
    const [hours, minutes, seconds] = timestamp.split(":").map(Number);

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

  try {
    const command =
      `${ffprobe_exe_path} -loglevel error -select_streams v:0 -show_entries packet=pts_time,flags -of csv=print_section=0 ` +
      `${fullPathVideo}`;

    console.log("command: ", command);

    const result = await execP(command, { maxBuffer: 1048576000 });
    const keyframes = [];

    result.stdout.split("\r\n").forEach((keyframe) => {
      if (keyframe.includes("K_")) {
        keyframes.push(parseFloat(keyframe.replace(",K__", "")));
      }
    });

    let file = ``;
    const ffmpegCommandsToRun = [];

    timestampsInSeconds.forEach((ts, index) => {
      const inBetweenKeyFrames = keyframes.filter(
        (kf) => ts.start <= kf && ts.end >= kf
      );

      const dotTo_ = (float) => float.toString().replace(/\./g, "_");
      const prefix = "segment_000000";

      if (inBetweenKeyFrames.length <= 1) {
        const videoSegmentName = `${segmentsFolderPath}${prefix}${index + 1}${
          ts.start
        }-${ts.end}${fileExtension}`;
        file += `file '${videoSegmentName}'\n`;
        ffmpegCommandsToRun.push(() =>
          execP(
            `${ffmpeg_exe_path} -i ${fullPathVideo} -ss ${ts.start} -to ${ts.end} ${videoSegmentName}`
          )
        );
      } else {
        const [firstKeyframe] = inBetweenKeyFrames;
        const lastKeyframe = inBetweenKeyFrames[inBetweenKeyFrames.length - 1];
        const videoSegmentNameBeginning = `${segmentsFolderPath}${prefix}${
          index + 1
        }${ts.start}-${dotTo_(firstKeyframe)}${fileExtension}`;

        ffmpegCommandsToRun.push(() =>
          execP(
            `${ffmpeg_exe_path} -i ${fullPathVideo} -ss ${ts.start} -to ${firstKeyframe} ${videoSegmentNameBeginning}`
          )
        );
        file += `file '${videoSegmentNameBeginning}'\n`;
        file += `file '${fullPathVideo}'\n`;
        file += `inpoint ${firstKeyframe}\n`;
        file += `outpoint ${lastKeyframe}\n`;

        const videoSegmentNameEnd = `${segmentsFolderPath}${prefix}${
          index + 1
        }${dotTo_(lastKeyframe)}-${ts.end}${fileExtension}`;
        ffmpegCommandsToRun.push(() =>
          execP(
            `${ffmpeg_exe_path} -i ${fullPathVideo} -ss ${lastKeyframe} -to ${ts.end} ${videoSegmentNameEnd}`
          )
        );
        file += `file '${videoSegmentNameEnd}'\n`;
      }
    });

    // Procesamos los comandos con límite de concurrencia
    const concurrencyLimit = 2; // O el valor que prefieras
    await processInBatches(ffmpegCommandsToRun, concurrencyLimit);

    try {
      const fileConcatFullPath = workingFolderPath + "concatfile.txt";
      fs.writeFileSync(fileConcatFullPath, file);

      const fileNameOutput = "final_result" + temporalVideoName;
      const fullPathOutputVideo = `${workingFolderPath}${fileNameOutput}${fileExtension}`;

      const concatCommand = `${ffmpeg_exe_path} -f concat -safe 0 -i ${fileConcatFullPath} -c copy ${fullPathOutputVideo}`;
      console.log("command: ", concatCommand);
      console.log(`File concatenated\n`);
      await execP(concatCommand);

      // Renombrar el video resultante
      const renamedVideoPath = `${workingFolderPath}${title}${fileExtension}`;
      fs.renameSync(fullPathOutputVideo, renamedVideoPath); // Renombramos el archivo
      console.log(`Video renamed to: ${renamedVideoPath}`);

      return renamedVideoPath;
    } catch (error) {
      console.log("File concat error: ", error);
    }
  } catch (error) {
    console.log("error: ", error);
  }
  console.log("------------------");
  console.log("\nDone");
}

export default cutAndConcatenateVideo;
