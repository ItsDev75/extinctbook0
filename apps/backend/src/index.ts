import "dotenv/config";
import { createServer } from "http";
import app from "./app";
import { initSocket } from "./socket";

const PORT = process.env.PORT || 3001;

const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => {
    console.log(`🚀 LiveMunshi API running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
});

export default httpServer;
