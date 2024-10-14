import validateDirectoryExists from "./validateDirectoryExists.js";
import validateTimestamps from "./validateTimestamps.js";
import validateMaxDuration from "./validateMaxDuration.js";

const validations = async (
  timestamps,
  workingFolderPath,
  segmentsFolderPath
) => {
  try {
    // Validate if the directories exist
    await Promise.all([
      validateDirectoryExists(workingFolderPath),
      validateDirectoryExists(segmentsFolderPath),
    ]);
    // Validates that in all timestamps the start property is less than the end property
    const wrongIndices = validateTimestamps(timestamps);
    if (wrongIndices) {
      throw new RangeError(
        `Error at validateTimestamps function, 'start' property cannot be greater than 'end' property at timestamps position: ${wrongIndices.indices}`
      );
    }

    // Validate if timestamp exceeds video duration
    // Create an array of promises for all timestamp validations
    const validationPromises = timestamps.map((timestamp, index) =>
      validateMaxDuration(timestamp, index)
        .then(() => ({ success: true, index }))
        .catch((error) => ({ success: false, index, error: error.message }))
    );

    // Wait for all validations to complete
    const results = await Promise.all(validationPromises);

    // Filter out the failed validations
    const failures = results.filter((result) => !result.success);

    if (failures.length > 0) {
      console.error("The following validations failed:");
      failures.forEach((failure) => {
        console.error(`Index ${failure.index}: ${failure.error}`);
      });
      throw new Error(
        "One or more validations failed. Check the logs for details."
      );
    }
  } catch (error) {
    console.error("Unsuccessful validation.");
    console.error("Stack:", error.stack);
    throw error;
  }
};

export default validations;
