import http from "http";
import mongoose from "mongoose";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { initializeSocket } from "./socket/socket-server.js";
import { notificationSchedulerService } from "./services/notification-scheduler.service.js";

async function bootstrap() {
  try {
    await mongoose.connect(env.mongoUri);
    const server = http.createServer(app);
    initializeSocket(server, env.corsOrigin);
    notificationSchedulerService.start();
    server.listen(env.port, () => {
      logger.info({ port: env.port }, "RHMS API listening");
    });
  } catch (error) {
    logger.error({ error }, "Failed to start RHMS API");
    process.exit(1);
  }
}

bootstrap();
