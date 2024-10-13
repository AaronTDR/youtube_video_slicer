import { exec } from "child_process";

const execP = (command) => {
  return new Promise((resolve, reject) => {
    console.log(`Executing command: ${command}`);
    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(error);
        return;
      }
      console.log(`Command completed: ${command}`);
      resolve({ stdout, stderr });
    });
  });
};

export default execP;
