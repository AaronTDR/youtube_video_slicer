import fs from "fs";
import path from "path";

/* const directoryPath = "C:/users/aaron/downloads/test/";
const fileName =
  "Nature WhatsApp Status Video 30 Seconds| Nature Love Song Background 2022|4k";

try {
  const files = fs.readdirSync(directoryPath);
  console.log("🚀 ~ files: LOL", files);
  const file = files.find((file) => {
    return file.includes(files);
  });
  console.log("🚀 ~ file: LOL", file);

  const extension = path.extname(file);
  console.log("🚀 ~ extension:", extension);

    if (file) {
    // El archivo se encontró
    console.log(`El archivo: ${file} se encontró en ${directoryPath}`);
    const extension = path.extname(file);
    console.log("🚀 ~ extension:", extension);
  } else {
    // El archivo no se encontró
    console.log(`El archivo: ${fileName} no se encontró en ${directoryPath}`);
  }
} catch (error) {
  // Se produjo un error al leer el directorio
  console.error(`Error al leer el directorio: ${error.message}`);

} */

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
