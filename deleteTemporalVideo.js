import fs from "fs";

const deleteTemporalVideo = (directoryPath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(directoryPath, (err) => {
      if (err) {
        console.error("Error al eliminar el archivo:", err);
        reject();
      } else {
        console.log("Archivo eliminado exitosamente.");
        resolve();
      }
    });
  });
};

export default deleteTemporalVideo;
