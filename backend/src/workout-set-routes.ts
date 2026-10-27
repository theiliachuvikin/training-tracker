import type { FastifyInstance } from "fastify";
import { DrizzleQueryError, asc, eq } from "drizzle-orm";
import { db } from "./db/client.js";
import { exercises, workoutSets } from "./db/schema.js";
import { listQuerySchema } from "./exercise-routes.js";
import { createWorkoutSetSchema, exerciseIdParamSchema } from "./workout-set.js";

const FOREIGN_KEY_VIOLATION = "23503";

function isForeignKeyViolation(error: unknown): boolean {
    if (!(error instanceof DrizzleQueryError)) {
        return false;
    }
    const cause: unknown = error.cause;
    return typeof cause == "object" && cause !== null && "code" in cause && cause.code == FOREIGN_KEY_VIOLATION;
}

export async function workoutSetRoutes(app: FastifyInstance) : Promise<void> {
    app.post("/exercises/:id/sets", async (request, reply) => {
        const params = exerciseIdParamSchema.safeParse(request.params);
        if (!params.success) {
            return reply.status(400).send({ errors: params.error.issues});
        }

        const body = createWorkoutSetSchema.safeParse(request.body);
        if (!body.success) {
            return reply.status(400).send({ errors: body.error.issues});
        }

        try {
            const [created] = await db
                .insert(workoutSets)
                .values({
                    exerciseId: params.data.id,
                    reps: body.data.reps,
                    weightKg: body.data.weightKg,
                    performedAt: new Date(body.data.performedAt),
                })
                .returning();

            if (!created) {
                throw new Error("Insert into workout_sets returned no row");
            }

            return reply.status(201).send(created);
        } catch (error) {
            if (isForeignKeyViolation(error)) {
                return reply.status(404).send({ error: "Exercise not found"});
            }
            throw error;
        }
    });

    app.get("/exercises/:id/sets", async (request, reply) => {
        const params = exerciseIdParamSchema.safeParse(request.params);
        if (!params.success) {
            return reply.status(400).send({ errors: params.error.issues });
        }
        const query = listQuerySchema.safeParse(request.query);
        if (!query.success) {
            return reply.status(400).send({ errors: query.error.issues });
        }

        // Решение: 404 для несуществующего упражнения, а не пустой список.
        // Иначе опечатка в id неотличима от «подходов ещё нет».
        const [exercise] = await db
            .select({ id: exercises.id })
            .from(exercises)
            .where(eq(exercises.id, params.data.id));
        if (!exercise) {
            return reply.status(404).send({ error: "Exercise not found" });
        }

        // По возрастанию времени — в этом порядке строится график прогресса; id — для стабильного порядка на одинаковом времени.
        return db
            .select()
            .from(workoutSets)
            .where(eq(workoutSets.exerciseId, params.data.id))
            .orderBy(asc(workoutSets.performedAt), asc(workoutSets.id))
            .limit(query.data.limit)
                .offset(query.data.offset);
    });
}