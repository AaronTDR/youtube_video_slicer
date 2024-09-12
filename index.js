import { config } from "./config.js";

import downloadVideoYtDlp from "./downloadVideo/downloadVideo.js";
import cutAndConcatenateVideo from "./cutAndConcatenateVideo/cutAndConcatenateVideo.js";

import validations from "./validations/validations.js";

import helpGetVideoTitle from "./helpers/helpGetVideoTitle.js";

import { deleteFile } from "./utils/functions.js";

import { promisify } from "util";
import { exec } from "child_process";
const execP = promisify(exec);

/*
 * url: Address of the video you want to section.
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
  url,
  timestamps,
  concurrencyLimit,
  isYoutubeShort,
} = config;

const ytConcatenateSlices = async (
  ffmpeg_exe_path,
  ffprobe_exe_path,
  workingFolderPath,
  segmentsFolderPath,
  url,
  timestamps
) => {
  try {
    // Validations
    await validations(url, timestamps, workingFolderPath);

    // helpGetVideoTitle and downloadVideoYtDlp are called
    const [title, { temporalVideoName, videoExtension }] = await Promise.all([
      helpGetVideoTitle(url),
      downloadVideoYtDlp(url, workingFolderPath),
    ]);

    const { fileNameOutputWithoutExtension, fileExtension } = await cutAndConcatenateVideo(
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
      const blurredShortName = `${fileNameOutputWithoutExtension}_blurred_top_bottom${fileExtension}`;
      const blurredShortFullPathname = `${workingFolderPath}${blurredShortName}`;

      const command = `${ffmpeg_exe_path} -i "${workingFolderPath}${fileNameOutputWithoutExtension}${fileExtension}" `
        + `-vf "split[original][copy];[copy]scale=-1:ih*(16/9)*(16/9),crop=w=ih*9/16,gblur=sigma=20[blurred];[blurred][original]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2" `
        + `"${blurredShortFullPathname}"`;
      console.log('\nCommand: ', command, '\n');
      await execP(command);
      console.log('Blurred video at the top and at the bottom for Shorts generated: ', blurredShortFullPathname, '\n');

    }
    console.log('Finished video');
  } catch (error) {
    console.error("Error occurred at validations function.", error);
  }
};

ytConcatenateSlices(
  ffmpeg_exe_path,
  ffprobe_exe_path,
  workingFolderPath,
  segmentsFolderPath,
  url,
  timestamps,
  concurrencyLimit
);
