import concatenateSegments from "./concatenateSegments.js";
import cycleSegments from "./cycleSegments.js";
import { generateSafeFileName } from "../utils/functions.js";

// Main function
async function cutAndConcatenateVideo() {
  try {
    const segments = await cycleSegments();

    const safeFileName = generateSafeFileName();

    // Concatenate the segments
    await concatenateSegments(segments.join(""), safeFileName);
  } catch (error) {
    console.error("Error at cutAndConcatenateVideo:", error);
  }
}

export default cutAndConcatenateVideo;
