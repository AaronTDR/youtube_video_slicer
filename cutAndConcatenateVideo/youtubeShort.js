import { execP } from "../utils/functions.js";
import { config } from "../config.js";

const { ffmpeg_exe_path, workingFolderPath, targetFormat, shortsConfig } =
  config;

const youtubeShort = async (fileNameOutput) => {
  const blurredShortName = `${fileNameOutput}_BLURRED_top_bottom${targetFormat}`;
  const blurredShortFullPathname = `${workingFolderPath}${blurredShortName}`;

  const command =
    `${ffmpeg_exe_path} -i "${workingFolderPath}${fileNameOutput}${targetFormat}" ` +
    `-vf "split[original][copy];[copy]scale=-1:(ih*0.80)*(16/9)*(16/9),crop=w=ih*9/16,gblur=sigma=25[blurred];[blurred][original]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2" ` +
    `"${blurredShortFullPathname}"`;
  await execP(command);

  const compatibleShortName = `${fileNameOutput}_COMPATIBLE_to_youtube_format.mp4`;
  const compatibleShortFullPathName = `${workingFolderPath}${compatibleShortName}`;
  const convertCommand =
    `${ffmpeg_exe_path} -i "${blurredShortFullPathname}" ` +
    `-c:v libx264 -crf 17 -preset fast ` +
    `${compatibleShortFullPathName}`;
  await execP(convertCommand);

  if (shortsConfig && shortsConfig.generateThumbnail === true) {
    if (
      typeof shortsConfig.shortThumbnailPath !== "string" ||
      shortsConfig.shortThumbnailPath.length === 0
    ) {
      const err = "\n You need to specify a Thumbnail image for the Short! \n";
      console.error(err);
      throw err;
    }

    const imageVideoShortName = `${fileNameOutput}_thumbnail_video.mp4`;
    const imageVideoShortFullPathname = `${workingFolderPath}${imageVideoShortName}`;

    const imageCommand =
      `${ffmpeg_exe_path} -loop 1 -framerate 60 -t 5 -i "${shortsConfig.shortThumbnailPath}" ` +
      `-f lavfi -i anullsrc=channel_layout=stereo:sample_rate=48000 -filter_complex "[0]scale=2560:4550:force_original_aspect_ratio=increase,crop=2560:4550,setsar=1,format=yuv420p[v]" ` +
      `-map "[v]" -map 1 -c:v libx264 -c:a aac -shortest "${imageVideoShortFullPathname}"`;
    await execP(imageCommand);
  }
};

export default youtubeShort;
