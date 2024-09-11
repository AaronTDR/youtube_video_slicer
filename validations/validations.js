import validateDirectoryExists from "./validateDirectoryExists.js";
import validateTimestamps from "./validateTimestamps.js";
import validateMaxDuration from "./validateMaxDuration.js";

const validations = async (videoUrl, timestamps, workingFolderPath) => {
  try {
    // Validate if the directory exists
    await validateDirectoryExists(workingFolderPath);

    // Validates that in all timestamps the start property is less than the end property
    const wrongIndices = validateTimestamps(timestamps);
    if (wrongIndices) {
      throw new RangeError(
        `Error at validateTimestamps function, 'start' property cannot be greater than 'end' property at timestamps position: ${wrongIndices.indices}`
      );
    }

    // Validate if timestamp exceeds video duration
    await validateMaxDuration(videoUrl, timestamps);
  } catch (error) {
    console.error("Unsuccessful validation.");
    console.error("Stack:", error.stack);
    throw error;
  }
};

export default validations;
