// src/utils/dateUtils.js
function safeToDate(input) {
  try {
    // If input is already a Date object, return it directly.
    if (input instanceof Date) {
      return input;
    }

    // If input is a Firebase Timestamp object, convert it to a Date object.
    // Firebase Timestamp objects have 'seconds' and 'nanoseconds' properties and a 'toDate' method.
    if (input && typeof input.toDate === 'function' && typeof input.seconds === 'number' && typeof input.nanoseconds === 'number') {
      return input.toDate();
    }

    // If input is a string or number, attempt to create a new Date object.
    if (typeof input === 'string' || typeof input === 'number') {
      const date = new Date(input);
      // Check if the created Date object is valid.
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  } catch (e) {
    // Log any errors that occur during the conversion process for debugging.
    console.error("Error in safeToDate:", e);
  }

  // If none of the above conditions are met, or an error occurs, return null.
  return null;
}

module.exports = { safeToDate };