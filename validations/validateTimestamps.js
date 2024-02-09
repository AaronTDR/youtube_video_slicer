// Prevent the start property from being greater than the end property
const validateTimestamps = (timestamps) => {
  let errors = [];

  timestamps.forEach((timestamp, i) => {
    const startTime = new Date(`1970-01-01T${timestamp.start}Z`).getTime();
    const endTime = new Date(`1970-01-01T${timestamp.end}Z`).getTime();

    if (startTime > endTime) {
      errors.push(i);
    }
  });

  return errors.length > 0 ? { indices: errors } : null;
};

export default validateTimestamps;
