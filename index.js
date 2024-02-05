import concatenateVideos from "./concatenateVideos.js";
import captureAndCutVideo from "./captureAndCutVideo.js";
import downloadVideoMarcosPromise from "./downloadVideo.js";

const url = "https://www.youtube.com/watch?v=jhvfYsYQXkc";
const timestamps = [
  { start: "00:00:00", end: "00:00:06" },
  { start: "00:00:20", end: "00:00:25" },
  /*{ start: "00:00:00", end: "00:04:10" },
  { start: "00:05:30", end: "00:06:00" },
  { start: "00:10:00", end: "00:10:50" }, */
];
const outputFile = "E:/projects/youtube_video_slicer/output";

const ytConcatenateSlices = async (videoUrl, timestamps, outputFile) => {

  try {
    console.log("before downloadVideo")
    const titleName = await downloadVideoMarcosPromise(videoUrl, outputFile);
    console.log("after downloadVideo\n\n")

    
    console.log("before captureAndCutVideo")
    await captureAndCutVideo(
      `${outputFile}/${titleName}.mp4`,
      timestamps,
      outputFile
    );
    console.log("after captureAndCutVideo\n\n")
    

    console.log("before concatenateVideos")
    const concatenatedVideo = await concatenateVideos(`${outputFile}/`);
    console.log("after concatenateVideos\n\n")


    console.log("Concatenated video: ", concatenatedVideo);
  } catch(error) {
    console.error("Something went wrong: ", error);
  }
};

// TAREA: Convertir la async function de arriba a promises en cadena
ytConcatenateSlices(url, timestamps, outputFile);
