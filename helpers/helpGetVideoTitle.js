import { execSync } from "child_process";

const helpGetVideoTitle = async (url) => {
  try {
    // Get video name
    const command = `yt-dlp --print-json --skip-download ${url}`;
    const output = execSync(command).toString();

    try {
      const jsonData = JSON.parse(output);
      const title = jsonData.title;
      return title;
    } catch (jsonError) {
      throw new Error(`Error parsing JSON: ${jsonError.message}`);
    }
  } catch (execError) {
    console.error("Error extracting video title:", execError.message);
    throw execError; // Propagate the error
  }
};

export default helpGetVideoTitle;
