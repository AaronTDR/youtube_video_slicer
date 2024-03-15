import fsPromises from "fs/promises";

const directoryExists = async (directoryPath) => {
  try {
    await fsPromises.readdir(directoryPath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    } else {
      throw error;
    }
  }
};

export default directoryExists;
