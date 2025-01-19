function setupOrderSocket(io) {
    io.on("connection", (socket) => {
        socket.on("newOrder", (orderData) => {
            io.emit("newOrder", orderData);
        });
        socket.on("disconnect", () => {
        });
    });
}

module.exports = setupOrderSocket;