import validateDirectoryExists from "./validateDirectoryExists.js";
import validateTimestamps from "./validateTimestamps.js";
import validateMaxDuration from "./validateMaxDuration.js";

const validations = async (
  timestamps,
  workingFolderPath,
  segmentsFolderPath
) => {
  // Array to store all validation results
  const validationResults = [];

  try {
    // Run directory and max duration validations in parallel
    const [directoryValidations, maxDurationValidations] = await Promise.all([
      // Directory validations
      Promise.all([
        validateDirectoryExists(workingFolderPath).catch((error) => ({
          type: "directoryError",
          error: `Working folder validation failed: ${error.message}`,
        })),
        validateDirectoryExists(segmentsFolderPath).catch((error) => ({
          type: "directoryError",
          error: `Segments folder validation failed: ${error.message}`,
        })),
      ]),
      // Max duration validations
      Promise.all(
        timestamps.map((timestamp, index) =>
          validateMaxDuration(timestamp, index)
            .then(() => ({ success: true, index }))
            .catch((error) => ({
              type: "maxDurationError",
              index,
              error: error.message,
            }))
        )
      ),
    ]);

    // Process directory validation results
    validationResults.push(...directoryValidations.filter((result) => result));

    // Process timestamp validation (synchronous)
    const timestampErrors = validateTimestamps(timestamps);
    if (timestampErrors) {
      validationResults.push({
        type: "timestampError",
        error: `'start' property cannot be greater than 'end' property at timestamps position: ${timestampErrors.indices}`,
      });
    }

    // Process max duration validation results
    const maxDurationErrors = maxDurationValidations.filter(
      (result) => result.type === "maxDurationError"
    );
    validationResults.push(...maxDurationErrors);

    // Check if there are any validation errors
    if (validationResults.length > 0) {
      console.error("The following validations failed:");
      validationResults.forEach((result) => {
        if (result.type === "maxDurationError") {
          console.error(
            `Max Duration Error at index ${result.index}: ${result.error}`
          );
        } else {
          console.error(`${result.type}: ${result.error}`);
        }
      });
      throw new Error(
        "One or more validations failed. Check the logs for details."
      );
    }

    console.log("All validations passed successfully.");
  } catch (error) {
    console.error("Validation process encountered an error:");
    console.error("Stack:", error.stack);
    throw error;
  }
};

export default validations;
