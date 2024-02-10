import { execSync } from "child_process";

const helpGetVideoTitle = async (url) => {
  try {
    // Get video name
    const command = `yt-dlp --print-json --skip-download ${url}`;
    const output = execSync(command).toString();
    const jsonData = await JSON.parse(output);
    const title = jsonData.title;

    return title;
  } catch (error) {
    console.error("Error extracting video title: ", error.message);
  }
};

export default helpGetVideoTitle;
