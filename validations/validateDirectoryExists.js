import fsPromises from "fs/promises";

const validateDirectoryExists = async (directoryPath) => {
  try {
    await fsPromises.readdir(directoryPath);
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(
        `Error at validateDirectoryExists function, directory: '${directoryPath}' does not exist.`
      );
    } else {
      throw new Error("Error at validateDirectoryExists function");
    }
  }
};

export default validateDirectoryExists;
