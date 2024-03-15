# YouTube Video Slicer

## Description

This script allows you to extract timestamps from a YouTube video or other video platforms. For each timestamp, a section of the original video is obtained, and finally, a new video is created by concatenating all the resulting sections.

## Setup

Before using this script, make sure you have the following requirements installed:

- Node
- GIT
- yt-dlp

### Installing yt-dlp with Python package manager

```bash
pip install yt-dlp
```

## Usage

### Repository Cloning

Clone the YouTube Video Slicer repository using the following command:

```
git clone https://github.com/AaronTDR/youtube_video_slicer.git
```

Alternatively, you can install the npm dependencies by running:

```
npm install
```

## Instructions

1. Open the `index.js` file.
2. Locate the `ytConcatenateSlices` function.
3. Provide appropriate values for the `url`, `directoryPath`, and `timestamps` parameters.
4. Execute the script using the `node index.js` command.

The script will process the video according to the specified timestamps, generating a new video for each timestamp in addition to concatenating the corresponding sections.

## Parameters

- `url`: The address of the video you want to section.
- `directoryPath`: The path of the directory where temporary files will be stored and where the final result will be saved.
- `timestamps`: An array containing timestamps in HH:MM:SS format.

Example of a timestamp format:

```
[
  { start: "HH:MM:SS", end: "HH:MM:SS" }
]
```

## Below is a brief description of the main internal processes within the `ytConcatenateSlices` function.

### Principal functions

- `downloadVideoYtDlp`
- `captureAndCutVideo`
- `concatenateVideos`

### downloadVideoYtDlp Function

Description

The `downloadVideoYtDlp` function allows downloading videos from a URL using **yt-dlp**.

Parameters

1. `url`: The URL of the video to be downloaded.
2. `outputDirectory`: The directory path where the downloaded video will be stored as a temporary file.

Implementation Details

- The function utilizes `child_process.spawn` to initiate a **yt-dlp** process in the background and download the video from the specified URL.
- A temporary name is set for the downloaded video, which is used to determine the file extension once the download is complete.
- Events are handled to capture the successful closure of the download process or any errors that may occur during the download.

### captureAndCutVideo Function

Description

The `captureAndCutVideo` function allows capturing specific segments from the temporary video file downloaded by the `downloadVideoYtDlp` function. These segments are then cut according to the provided timestamps and saved as independent video files. This functionality enables the generation of video segments from an input video.

Parameters

1. `inputVideoDirectory`: The directory path where the original video is located.
2. `timestamps`: An array of timestamps specifying the start and end points of the segments to capture and cut.
3. `temporalVideoName`: The temporary name of the original video.
4. `videoFormat`: The format of the original video.
5. `outputDirectory`: The directory path where the cut video segments will be stored.

Implementation Details

- The function utilizes `ffmpeg` to cut the segments according to the provided timestamps.
- Unique file names are generated for each video segment based on the current date and time.
- Events are handled to capture the successful completion of the cutting process or any errors that may occur during the process.

### concatenateVideos Function

Description

The `concatenateVideos` function allows the concatenation of multiple videos into a single output video. It efficiently combines video files while preserving their original quality and formats.

Parameters

1. `inputDirectory`: The directory path where the videos to be concatenated are located.
2. `title`: The title to be assigned to the resulting video.
3. `videoExtension`: The extension of the video files being concatenated.

Implementation Details

- The function utilizes **ffmpeg** to perform video concatenation.
- Video files in the input directory are validated, and those containing the `segment{segment_number}` tag in their name are filtered.
- A concatenation list file (`concat.txt`) is generated, specifying the order of the videos to concatenate.
- The **ffmpeg** command is executed to concatenate the videos.
