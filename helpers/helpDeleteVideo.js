import fs from "fs";

const helpDeleteVideo = (directoryPath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(directoryPath, (err) => {
      if (err) {
        console.error("Error deleting the file:", err);
        reject();
      } else {
        console.log("File successfully deleted.");
        resolve();
      }
    });
  });
};

export default helpDeleteVideo;
