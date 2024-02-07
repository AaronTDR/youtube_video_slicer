import fs from "fs";
import path from "path";

const getExtension = (directoryPath, videoName) => {
  try {
    // Read the contents of the specified directory synchronously.
    const files = fs.readdirSync(directoryPath);

    // Find a file in the list that includes the specified videoName.
    const foundFile = files.find((file) => file.includes(videoName));

    if (foundFile) {
      const videoExtension = path.extname(foundFile);
      return videoExtension;
    } else {
      throw new Error(
        `Video: '${videoName}' not found in directory: '${directoryPath}', the file extension could not be obtained `
      );
    }
  } catch (error) {
    console.log(error);
    return ".mp4";
  }
};

export default getExtension;
