import fs from "fs";
import execP from "./execP.js";
import { config } from "../config.js";

const {
  ffmpeg_exe_path,
  workingFolderPath,
  targetFormat,
  shortsConfig,
  isYoutubeShort,
} = config;

async function concatenateSegments(file, videoName) {
  try {
    const fileConcatFullPath = `${workingFolderPath}concatfile.txt`;
    fs.writeFileSync(fileConcatFullPath, file);

    const fileNameOutputWithoutExtension = `_final_result_${videoName}`;
    const fullPathOutputVideo = `${workingFolderPath}${fileNameOutputWithoutExtension}${targetFormat}`;
    const concatCommand = `${ffmpeg_exe_path} -f concat -safe 0 -i ${fileConcatFullPath} -c copy ${fullPathOutputVideo}`;
    await execP(concatCommand);

    if (isYoutubeShort === true) {
      const blurredShortName = `${fileNameOutputWithoutExtension}_BLURRED_top_bottom${targetFormat}`;
      const blurredShortFullPathname = `${workingFolderPath}${blurredShortName}`;

      const command =
        `${ffmpeg_exe_path} -i "${workingFolderPath}${fileNameOutputWithoutExtension}${targetFormat}" ` +
        `-vf "split[original][copy];[copy]scale=-1:(ih*0.80)*(16/9)*(16/9),crop=w=ih*9/16,gblur=sigma=25[blurred];[blurred][original]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2" ` +
        `"${blurredShortFullPathname}"`;
      console.log("\nCommand: ", command, "\n");
      await execP(command);
      console.log(
        "Blurred video at the top and at the bottom for Shorts generated: ",
        blurredShortFullPathname,
        "\n"
      );

      const compatibleShortName = `${fileNameOutputWithoutExtension}_COMPATIBLE_to_youtube_format${targetFormat}`;
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

        const imageVideoShortName = `${fileNameOutputWithoutExtension}_thumbnail_video${targetFormat}`;
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

export default concatenateSegments;
