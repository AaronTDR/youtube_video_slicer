import fs from "fs";
import { exec } from "child_process";
import path from "path";
import {
  processInBatches,
  getSeconds,
  generateSafeFileName,
} from "../utils/functions.js";
import { config } from "../config.js";
import { updateUrlsWithPaths } from "../utils/functions.js";

const execP = (command) => {
  return new Promise((resolve, reject) => {
    console.log(`Executing command: ${command}`);
    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(error);
        return;
      }
      console.log(`Command completed: ${command}`);
      resolve({ stdout, stderr });
    });
  });
};

const {
  ffmpeg_exe_path,
  ffprobe_exe_path,
  workingFolderPath,
  segmentsFolderPath,
  timestamps,
  concurrencyLimit,
  isYoutubeShort,
  shortsConfig,
} = config;

// Helper function for FFmpeg time format
const formatFFmpegTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = (seconds % 60).toFixed(3);
  return [hours, minutes, secs]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
};

// Function to extract video segments
async function extractSegments(
  fullPathVideo,
  timestampInSeconds,
  keyframes,
  fileExtension,
  sortableDate
) {
  const ts = timestampInSeconds;
  const ffmpegCommandsToRun = [];
  let file = ``;
  let optimizationsFound = 0;

  const inBetweenKeyFrames = keyframes.filter(
    (kf) => ts.start < kf && ts.end > kf
  );

  const dotTo_ = (float) => float.toString().replace(/\./g, "_");
  const prefix = `${sortableDate}_segment_000000`;

  if (inBetweenKeyFrames.length <= 1) {
    const videoSegmentName = `${segmentsFolderPath}${prefix}${ts.start}-${ts.end
      .toString()
      .replace(/[:]/g, "_")}${fileExtension}`;
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
    const videoSegmentNameBeginning = `${segmentsFolderPath}${prefix}${dotTo_(
      ts.start
    )}-${dotTo_(firstKeyframe)}${fileExtension}`;

    ffmpegCommandsToRun.push(() =>
      execP(
        `${ffmpeg_exe_path} -i ${fullPathVideo} -ss ${formatFFmpegTime(
          ts.start
        )} -to ${formatFFmpegTime(firstKeyframe)} ${videoSegmentNameBeginning}`
      )
    );
    file += `file '${videoSegmentNameBeginning}'\n`;
    file += `file '${fullPathVideo}'\n`;
    file += `inpoint ${firstKeyframe}\n`;
    file += `outpoint ${lastKeyframe}\n`;

    const videoSegmentNameEnd = `${segmentsFolderPath}${prefix}${dotTo_(
      lastKeyframe
    )}-${dotTo_(ts.end)}${fileExtension}`;
    ffmpegCommandsToRun.push(() =>
      execP(
        `${ffmpeg_exe_path} -i ${fullPathVideo} -ss ${formatFFmpegTime(
          lastKeyframe
        )} -to ${formatFFmpegTime(ts.end)} ${videoSegmentNameEnd}`
      )
    );
    file += `file '${videoSegmentNameEnd}'\n`;
  }

  return {
    file,
    commands: ffmpegCommandsToRun,
  };
}

async function concatenateSegments(
  ffmpeg_exe_path,
  workingFolderPath,
  file,
  temporalVideoName,
  fileExtension
) {
  try {
    const fileConcatFullPath = `${workingFolderPath}concatfile.txt`;
    fs.writeFileSync(fileConcatFullPath, file);

    const fileNameOutputWithoutExtension = `_final_result_${temporalVideoName}`;
    const fullPathOutputVideo = `${workingFolderPath}${fileNameOutputWithoutExtension}${fileExtension}`;
    const concatCommand = `${ffmpeg_exe_path} -f concat -safe 0 -i ${fileConcatFullPath} -c copy ${fullPathOutputVideo}`;
    await execP(concatCommand);

    if (isYoutubeShort === true) {
      const blurredShortName = `${fileNameOutputWithoutExtension}_BLURRED_top_bottom${fileExtension}`;
      const blurredShortFullPathname = `${workingFolderPath}${blurredShortName}`;

      const command =
        `${ffmpeg_exe_path} -i "${workingFolderPath}${fileNameOutputWithoutExtension}${fileExtension}" ` +
        `-vf "split[original][copy];[copy]scale=-1:(ih*0.80)*(16/9)*(16/9),crop=w=ih*9/16,gblur=sigma=25[blurred];[blurred][original]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2" ` +
        `"${blurredShortFullPathname}"`;
      console.log("\nCommand: ", command, "\n");
      await execP(command);
      console.log(
        "Blurred video at the top and at the bottom for Shorts generated: ",
        blurredShortFullPathname,
        "\n"
      );

      const compatibleShortName = `${fileNameOutputWithoutExtension}_COMPATIBLE_to_youtube_format${fileExtension}`;
      const compatibleShortFullPathName = `${workingFolderPath}${compatibleShortName}`;
      const convertCommand =
        `${ffmpeg_exe_path} -i "${blurredShortFullPathname}" ` +
        `-c:v libx264 -crf 17 -preset fast ` +
        `${compatibleShortFullPathName}`;
      console.log("\nCommand: ", convertCommand, "\n");
      await execP(convertCommand);
      console.log(
        "Video converted to compatible format for Youtube Shorts: ",
        compatibleShortFullPathName,
        "\n"
      );

      if (shortsConfig && shortsConfig.generateThumbnail === true) {
        if (
          typeof shortsConfig.shortThumbnailPath !== "string" ||
          shortsConfig.shortThumbnailPath.length === 0
        ) {
          const err =
            "\n You need to specify a Thumbnail image for the Short! \n";
          console.error(err);
          throw err;
        }

        const imageVideoShortName = `${fileNameOutputWithoutExtension}_thumbnail_video${fileExtension}`;
        const imageVideoShortFullPathname = `${workingFolderPath}${imageVideoShortName}`;

        const imageCommand =
          `${ffmpeg_exe_path} -loop 1 -framerate 60 -t 5 -i "${shortsConfig.shortThumbnailPath}" ` +
          `-f lavfi -i anullsrc=channel_layout=stereo:sample_rate=48000 -filter_complex "[0]scale=2560:4550:force_original_aspect_ratio=increase,crop=2560:4550,setsar=1,format=yuv420p[v]" ` +
          `-map "[v]" -map 1 -c:v libx264 -c:a aac -shortest "${imageVideoShortFullPathname}"`;
        console.log("\nCommand: ", imageCommand, "\n");
        await execP(imageCommand);
        console.log(
          "Created video from image: ",
          imageVideoShortFullPathname,
          "\n"
        );
      }
    }
  } catch (error) {
    console.error("File concat error: ", error);
    throw error;
  }
}

const cycleSegments = async () => {
  const { workingFolderPath, timestamps, concurrencyLimit } = config;
  const timestampsWithPaths = updateUrlsWithPaths(
    workingFolderPath,
    timestamps
  );

  const sortableDate = new Date().toISOString().replace(/[:.]/g, "_");

  const segmentPromises = [];

  for (const timestamp of timestampsWithPaths) {
    const extension = path.extname(timestamp.path);

    try {
      console.log(`Processing timestamp: ${JSON.stringify(timestamp)}`);

      const command = `${config.ffprobe_exe_path} -loglevel error -select_streams v:0 -show_entries packet=pts_time,flags -of csv=print_section=0 ${timestamp.path}`;

      const result = await execP(command, { maxBuffer: 1048576000 });
      const keyframes = [];

      result.stdout.split(/\r?\n/).forEach((keyframe) => {
        if (keyframe.includes("K_")) {
          keyframes.push(parseFloat(keyframe.replace(",K__", "")));
        }
      });

      console.log(`Keyframes found: ${keyframes.length}`);

      const timestampsInSeconds = {
        start: getSeconds(timestamp.start),
        end: getSeconds(timestamp.end),
      };

      const { file, commands } = await extractSegments(
        timestamp.path,
        timestampsInSeconds,
        keyframes,
        extension,
        sortableDate
      );

      segmentPromises.push({ file, commands });
      console.log(`Segment extraction prepared for: ${timestamp.path}`);
    } catch (error) {
      console.error(
        `Error processing timestamp ${JSON.stringify(timestamp)}:`,
        error
      );
    }
  }

  console.log(`Total segments prepared: ${segmentPromises.length}`);

  const allCommands = segmentPromises.flatMap((segment) => segment.commands);
  await processInBatches(allCommands, concurrencyLimit);

  return segmentPromises.map((segment) => segment.file);
};
// Main function
async function cutAndConcatenateVideo(concurrencyLimit) {
  try {
    const segments = await cycleSegments();

    const safeFileName = generateSafeFileName();
    const targetFormat = ".mp4";

    // Concatenate the segments
    await concatenateSegments(
      ffmpeg_exe_path,
      workingFolderPath,
      segments.join(""),
      safeFileName,
      targetFormat
    );
  } catch (error) {
    console.error("Error in cutAndConcatenateVideo:", error);
  }
}

export default cutAndConcatenateVideo();
