function setupOrderSocket(io) {
    io.on("connection", (socket) => {
        socket.on("newOrder", (orderData) => {
            io.emit("newOrder", orderData);
        });
        socket.on("UpdateOrder", (order) => {
            console.log("UpdateOrder", order);
            io.emit("UpdateOrder", order);
        });
        socket.on("disconnect", () => {
        });
    });
}

module.exports = setupOrderSocket;