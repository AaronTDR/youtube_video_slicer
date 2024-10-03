// * Prevent the start property from being greater than the end property
// If an error is found, it returns the index of the error.
const validateTimestamps = (timestamps) => {
  let errors = [];
  timestamps.forEach((timestamp, i) => {
    // Adjust to parse with milliseconds
    const startTime = new Date(`1970-01-01T${timestamp.start}Z`).getTime();
    const endTime = new Date(`1970-01-01T${timestamp.end}Z`).getTime();
    if (startTime >= endTime) {
      errors.push(i);
    }
  });
  return errors.length > 0 ? { indices: errors } : null;
};

export default validateTimestamps;
