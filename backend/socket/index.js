const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("📡 New client:", socket.id);

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });
};

module.exports = setupSocket;
