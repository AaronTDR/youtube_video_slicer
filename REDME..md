# YouTube Video Slicer

## Description

This script allows you to extract timestamps from a YouTube video or other video platforms. For each timestamp, a section of the original video is obtained, and finally, a new video is created by concatenating all the resulting sections.

## Setup

Before using this script, make sure you have the following requirements installed:

- Node
- GIT
- yt-dlp

### Installing de yt-dlp

To install yt-dlp, you can follow one of the following options:

#### Installation via Python package manager

```bash
pip install yt-dlp
```

# Usage

## Repository Cloning

Clone the YouTube Video Slicer repository using the following command:

```
git clone https://github.com/AaronTDR/youtube_video_slicer.git
```

Alternatively, you can install the npm dependencies by running:

```
npm install
```

# Parameters

- `url`: The address of the video you want to section.
- `directoryPath`: The path of the directory where temporary files will be stored and where the final result will be saved.
- `timestamps`: An array containing timestamps in HH:MM:SS format.

```
[
  { start: "HH:MM:SS", end: "HH:MM:SS" }
]
```

## Instructions

1. Open the `index.js` file in your preferred code editor.
2. Locate the `ytConcatenateSlices` function.
3. Provide appropriate values for the `url`, `directoryPath`, and `timestamps` parameters.
4. Execute the script using the node `index.js` command.

The script will process the video according to the specified timestamps, generating a new video for each timestamp in addition to concatenating the corresponding sections.
