import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { DisplayBoardEntry } from "@livemunshi/shared";

let io: Server;

export function initSocket(httpServer: HttpServer): Server {
    io = new Server(httpServer, {
        cors: {
            origin: ["http://localhost:3000", "http://localhost:8081"],
            credentials: true,
        },
    });

    // ── Display Board Namespace ────────────────────────────
    const displayBoard = io.of("/display-board");

    displayBoard.on("connection", (socket) => {
        console.log(`📡 Display board client connected: ${socket.id}`);

        // Client joins a specific court room
        socket.on("join:court", (courtId: string) => {
            socket.join(courtId);
            console.log(`Client ${socket.id} joined court: ${courtId}`);
        });

        socket.on("disconnect", () => {
            console.log(`📡 Display board client disconnected: ${socket.id}`);
        });
    });

    // ── General Namespace ─────────────────────────────────
    io.on("connection", (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);

        socket.on("disconnect", () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });

    return io;
}

// Emit a display board update to all clients watching a specific court
export function emitDisplayBoardUpdate(courtId: string, entries: DisplayBoardEntry[]): void {
    if (!io) return;
    io.of("/display-board").to(courtId).emit("board:update", entries);
}

export function getIO(): Server {
    if (!io) throw new Error("Socket.io not initialized");
    return io;
}
