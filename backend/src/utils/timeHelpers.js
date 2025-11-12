// Helper function: Get Vietnam time string
function getVietnamTimeString() {
  const now = new Date();
  const vietnamTimeString = now.toLocaleString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return vietnamTimeString.replace(", ", " ");
}

module.exports = {
  getVietnamTimeString,
};
