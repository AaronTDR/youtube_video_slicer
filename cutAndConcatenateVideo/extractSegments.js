import { execP, formatFFmpegTime } from "../utils/functions.js";
import { config } from "../config.js";

const { ffmpeg_exe_path, segmentsFolderPath } = config;

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

  // if (true) { // NEEDED FOR MP4 files
  if (inBetweenKeyFrames.length <= 1) {
    const videoSegmentName = `${segmentsFolderPath}${prefix}${ts.start}-${ts.end
      .toString()
      .replace(/[:]/g, "_")}${fileExtension}`; // Original
      // .replace(/[:]/g, "_")}${'.mp4'}`;// TO CONVERT TO MP4 ALWAYS
    file += `file '${videoSegmentName}'\n`;
    ffmpegCommandsToRun.push(() =>
      // Without converting to MP4 (original)
      execP(
        `${ffmpeg_exe_path} -i ${fullPathVideo} -ss ${formatFFmpegTime(
          ts.start
        )} -to ${formatFFmpegTime(ts.end)} -map 0 ${videoSegmentName}`
      )

      // For .MKV OBS files
      // execP(
      //   `${ffmpeg_exe_path} -i ${fullPathVideo} -ss ${formatFFmpegTime(
      //     ts.start
      //   )} -to ${formatFFmpegTime(ts.end)} -map 0 -c:v libx264 -crf 18 -c:a aac -b:a 192k ${videoSegmentName}`
      // )

      // TO CONVERT TO MP4 ALWAYS
      // execP(
      //     `${ffmpeg_exe_path} -i ${fullPathVideo} -ss ${formatFFmpegTime(
      //       ts.start
      //     )} -to ${formatFFmpegTime(ts.end)} -map 0 -c:v libx264 -c:a aac ${videoSegmentName}`
      //   )
    );
  } else {
    optimizationsFound++;
    const [firstKeyframe] = inBetweenKeyFrames;
    const lastKeyframe = inBetweenKeyFrames[inBetweenKeyFrames.length - 1];
    const videoSegmentNameBeginning = `${segmentsFolderPath}${prefix}${dotTo_(
      ts.start
    )}-${dotTo_(firstKeyframe)}${fileExtension}`;

    // Without converting to MP4 (original)
    ffmpegCommandsToRun.push(() =>
      execP(
        `${ffmpeg_exe_path} -i ${fullPathVideo} -ss ${formatFFmpegTime(
          ts.start
        )} -to ${formatFFmpegTime(firstKeyframe)} -map 0 ${videoSegmentNameBeginning}`
      )
    );

    // For .MKV OBS files
    // ffmpegCommandsToRun.push(() =>
    //   execP(
    //     `${ffmpeg_exe_path} -i ${fullPathVideo} -ss ${formatFFmpegTime(
    //       ts.start
    //     )} -to ${formatFFmpegTime(firstKeyframe)} -map 0 -c:v libx264 -crf 18 -c:a aac -b:a 192k ${videoSegmentNameBeginning}`
    //   )
    // );

    file += `file '${videoSegmentNameBeginning}'\n`;
    file += `file '${fullPathVideo}'\n`;
    file += `inpoint ${firstKeyframe}\n`;
    file += `outpoint ${lastKeyframe}\n`;

    const videoSegmentNameEnd = `${segmentsFolderPath}${prefix}${dotTo_(
      lastKeyframe
    )}-${dotTo_(ts.end)}${fileExtension}`

    // Without converting to MP4 (original)
    ffmpegCommandsToRun.push(() =>
      execP(
        `${ffmpeg_exe_path} -i ${fullPathVideo} -ss ${formatFFmpegTime(
          lastKeyframe
        )} -to ${formatFFmpegTime(ts.end)} -map 0 ${videoSegmentNameEnd}`
      )
    );

    // For .MKV OBS files
    // ffmpegCommandsToRun.push(() =>
    //   execP(
    //     `${ffmpeg_exe_path} -i ${fullPathVideo} -ss ${formatFFmpegTime(
    //       lastKeyframe
    //     )} -to ${formatFFmpegTime(ts.end)} -map 0 -c:v libx264 -crf 18 -c:a aac -b:a 192k ${videoSegmentNameEnd}`
    //   )
    // );
    file += `file '${videoSegmentNameEnd}'\n`;
  }

  return {
    file,
    commands: ffmpegCommandsToRun,
  };
}

export default extractSegments;
