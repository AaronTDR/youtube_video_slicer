import { config } from "./config.js";

import downloadVideoYtDlp from "./downloadVideo/downloadVideo.js";
import cutAndConcatenateVideo from "./cutAndConcatenateVideo/cutAndConcatenateVideo.js";

import validations from "./validations/validations.js";

import helpGetVideoTitle from "./helpers/helpGetVideoTitle.js";

import { deleteFile, groupById } from "./utils/functions.js";

import { promisify } from "util";
import { exec } from "child_process";
const execP = promisify(exec);

/*
 * directoryPath: Path of the directory where the temporary files will be stored and where the final result will be saved.
 * timestamps: Array corresponding to timestamps in HH:MM:SS format.
 * concurrencyLimit: Limit the number of segments that are processed at a time.
 * ffmpeg_exe_path: Path to ffmpeg executable.
 * ffprobe_exe_path: Path to ffprobe executable
 */

const {
  ffmpeg_exe_path,
  ffprobe_exe_path,
  workingFolderPath,
  segmentsFolderPath,
  timestamps,
  concurrencyLimit,
  isYoutubeShort,
  shortThumbnailPath,
  shortsConfig,
} = config;

// Sort timestamps by URL ID
const sortedTimestamps = groupById(timestamps);

const ytConcatenateSlices = async (
  ffmpeg_exe_path,
  ffprobe_exe_path,
  workingFolderPath,
  segmentsFolderPath,
  timestampsArray
) => {
  try {
    // Validations
    timestampsArray.forEach(async (timestamps) => {
      await validations(timestamps, workingFolderPath);

      // helpGetVideoTitle and downloadVideoYtDlp are called
      const [title, { temporalVideoName, videoExtension }] = await Promise.all([
        helpGetVideoTitle(timestamps[0].url),
        downloadVideoYtDlp(timestamps[0].url, workingFolderPath),
      ]);

      const { fileNameOutputWithoutExtension, fileExtension } =
        await cutAndConcatenateVideo(
          ffmpeg_exe_path,
          ffprobe_exe_path,
          title,
          workingFolderPath,
          segmentsFolderPath,
          timestamps,
          temporalVideoName,
          videoExtension,
          concurrencyLimit
        );
      // Delete temporary video
      await deleteFile(workingFolderPath + temporalVideoName + videoExtension);

      if (isYoutubeShort === true) {
        // Blur top and bottom of video and make it vertical
        const blurredShortName = `${fileNameOutputWithoutExtension}_BLURRED_top_bottom${fileExtension}`;
        const blurredShortFullPathname = `${workingFolderPath}${blurredShortName}`;

        const command =
          `${ffmpeg_exe_path} -i "${workingFolderPath}${fileNameOutputWithoutExtension}${fileExtension}" ` +
          `-vf "split[original][copy];[copy]scale=-1:(ih*0.80)*(16/9)*(16/9),crop=w=ih*9/16,gblur=sigma=25[blurred];[blurred][original]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2` +
          `"${blurredShortFullPathname}"`;
        console.log("\nCommand: ", command, "\n");
        await execP(command);
        console.log(
          "Blurred video at the top and at the bottom for Shorts generated: ",
          blurredShortFullPathname,
          "\n"
        );

        // Converted video to a compatible Short format for the Android app
        const compatibleShortName = `${fileNameOutputWithoutExtension}_COMPATIBLE_to_youtube_format.mp4`;
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
          // Generate Short video thumbnail from image to be able to concatenate that to the `compatibleShortName` video
          if (
            typeof shortsConfig.shortThumbnailPath !== "string" &&
            shortsConfig.shortThumbnailPath.length === 0
          ) {
            const err =
              "\n You need to specify a Thumbnail image for the Short! \n";
            console.error(err);
            throw err;
          }

          const imageVideoShortName = `${fileNameOutputWithoutExtension}_thumbnail_video.mp4`;
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
    });

    console.log("-----DONE-----");
  } catch (error) {
    console.error("Error occurred at validations function.", error);
  }
};

ytConcatenateSlices(
  ffmpeg_exe_path,
  ffprobe_exe_path,
  workingFolderPath,
  segmentsFolderPath,
  sortedTimestamps,
  concurrencyLimit
);
