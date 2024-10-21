import fs from "fs";
import youtubeShort from "./youtubeShort.js";
import { config } from "../config.js";
import { execP } from "../utils/functions.js";

const { ffmpeg_exe_path, workingFolderPath, targetFormat, isYoutubeShort } =
  config;

async function concatenateSegments(file, videoName) {
  try {
    const fileConcatFullPath = `${workingFolderPath}concatfile.txt`;
    fs.writeFileSync(fileConcatFullPath, file);

    const fileNameOutputWithoutExtension = `_final_result_${videoName}`;
    const fullPathOutputVideo = `${workingFolderPath}${fileNameOutputWithoutExtension}${targetFormat}`;
    const concatCommand = `${ffmpeg_exe_path} -f concat -safe 0 -i ${fileConcatFullPath} -c copy ${fullPathOutputVideo}`;
    await execP(concatCommand);

    if (isYoutubeShort === true) {
      await youtubeShort(fileNameOutputWithoutExtension);
    }
  } catch (error) {
    console.error("File concat error: ", error);
    throw error;
  }
}

export default concatenateSegments;
