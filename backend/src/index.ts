import Fastify from "fastify";
import { exerciseRoutes } from "./exercise-routes.js";
import {workoutSetRoutes} from "./workout-set-routes.js";
import {progressRoutes} from "./progress-routes.js";

const app = Fastify({logger: true});

app.get("/health", async () => {
    return { status: "ok" };
});

await app.register(exerciseRoutes);
await app.register(workoutSetRoutes);
await app.register(progressRoutes);
await app.listen({port: 3000, host: "0.0.0.0"});
