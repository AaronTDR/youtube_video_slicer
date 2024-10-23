let extension = ".webm"; // Default value

const validExtensions = [
  ".mp4",
  ".avi",
  ".mov",
  ".mkv",
  ".webm",
  ".flv",
  ".wmv",
  ".mpeg",
  ".3gp",
  ".m4v",
];

export const getTargetExtension = () => {
  if (!extension) {
    throw new Error("The extension is not defined.");
  }
  return extension;
};

export const setTargetExtension = (updatedExtension) => {
  if (
    typeof updatedExtension !== "string" ||
    !updatedExtension.startsWith(".")
  ) {
    throw new Error("Invalid extension. Must be a string starting with '.'");
  }
  if (!validExtensions.includes(updatedExtension.toLowerCase())) {
    throw new Error(`Unsupported extension. ${validExtensions.join(", ")}`);
  }
  extension = updatedExtension;
};
