import type {FastifyInstance} from "fastify";
import {and, asc, eq, gte, lte, sql, type SQL} from "drizzle-orm";
import { db } from "./db/client.js";
import { exercises, workoutSets } from "./db/schema.js";
import { progressQuerySchema } from "./progress.js";
import { exerciseIdParamSchema } from "./workout-set.js";

export async function progressRoutes(app: FastifyInstance): Promise<void> {
    app.get("/exercises/:id/progress", async (request, reply) => {
        const params = exerciseIdParamSchema.safeParse(request.params);
        if (!params.success) {
            return reply.status(400).send({errors: params.error.issues});
        }

        const query = progressQuerySchema.safeParse(request.query);
        if (!query.success) {
            return reply.status(400).send({errors: query.error.issues});
        }

        const [exercise] = await db
            .select({id: exercises.id})
            .from(exercises)
            .where(eq(exercises.id, params.data.id));
        if (!exercise) {
            return reply.status(404).send({error: "Exercise not found"});
        }

        const filters: SQL[] = [eq(workoutSets.exerciseId, params.data.id)];
        if (query.data.from !== undefined) {
            filters.push(gte(workoutSets.performedAt, new Date(query.data.from)));
        }
        if (query.data.to !== undefined) {
            filters.push(lte(workoutSets.performedAt, new Date(query.data.to)));
        }

        const perSet = db
            .select({
                day: sql<string>`to_char(${workoutSets.performedAt} at time zone ${query.data.tz}, 'YYYY-MM-DD')`.as("day"),
                weightKg: sql<string>`${workoutSets.weightKg}`.as("weight_kg"),
                e1rmKg: sql<string>`case when ${workoutSets.reps} = 1 then ${workoutSets.weightKg}
                    else round(${workoutSets.weightKg} * (1 + ${workoutSets.reps} / 30.0), 2) end`.as("e1rm_kg"),
            })
            .from(workoutSets)
            .where(and(...filters))
            .as("per_set");

        return db
            .select({
                day: perSet.day,
                maxWeightKg: sql<number>`max(${perSet.weightKg})`.mapWith(Number),
                bestE1rmKg: sql<number>`max(${perSet.e1rmKg})`.mapWith(Number),
                sets: sql<number>`count(*)`.mapWith(Number),
            })
            .from(perSet)
            .groupBy(perSet.day)
            .orderBy(perSet.day)
            .limit(query.data.limit)
            .offset(query.data.offset);
    });
}