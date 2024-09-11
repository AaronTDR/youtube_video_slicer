import fsPromises from "fs/promises";

const validateDirectoryExists = async (workingFolderPath) => {
  try {
    await fsPromises.readdir(workingFolderPath);
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(
        `Error at validateDirectoryExists function, directory: '${workingFolderPath}' does not exist.`
      );
    } else {
      throw new Error("Error at validateDirectoryExists function");
    }
  }
};

export default validateDirectoryExists;
