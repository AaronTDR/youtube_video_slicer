import execP from "./execP.js";
import { formatFFmpegTime } from "../utils/functions.js";
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

export default extractSegments;
