import { NextRequest } from "next/server";
import { Server as IOServer } from "socket.io";

// This file sets up a simple Socket.IO server as a singleton on the Next.js server runtime
// Clients connect via `/api/socket` using WebSocket transport

let io: IOServer | undefined;

export async function GET(_req: NextRequest) {
  if (!io) {
    // @ts-expect-error - attach to globalThis to persist across hot reloads in dev
    if (!globalThis._io) {
      // @ts-expect-error - store reference globally
      globalThis._io = new IOServer({
        // Restrict to websockets for stability in serverless-like environments
        transports: ["websocket"],
      });
    }
    // @ts-expect-error - read from globalThis
    io = globalThis._io as IOServer;

    io.on("connection", (socket) => {
      socket.on("join:project", (projectId: string) => {
        socket.join(`project:${projectId}`);
      });

      socket.on("join:task", (taskId: string) => {
        socket.join(`task:${taskId}`);
      });
    });
  }

  return new Response("Socket.IO ready", { status: 200 });
}