import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "./db/client.js";
import { exercises } from "./db/schema.js";
import { createExerciseSchema } from "./exercise.js";

// Решение: limit/offset, а не курсор. Список упражнений небольшой и редко растёт,
// курсорная пагинация усложнила бы клиент без выигрыша. Потолок limit защищает от выгрузки всей таблицы.
export const listQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
});

export async function exerciseRoutes(app: FastifyInstance): Promise<void> {
    app.get("/exercises", async (request, reply) => {
        const query = listQuerySchema.safeParse(request.query);
        if (!query.success) {
            return reply.status(400).send({errors: query.error.issues});
        }
        return db
            .select()
            .from(exercises)
            .orderBy(exercises.createdAt, exercises.id)
            .limit(query.data.limit)
            .offset(query.data.offset);
    });

    app.post("/exercises", async (request, reply) => {
        const parsed = createExerciseSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({ errors: parsed.error.issues });
        }

        const [created] = await db.insert(exercises).values(parsed.data).returning();
        if (!created) {
            throw new Error("Insert into exercises returned no row");
        }
        return reply.status(201).send(created);
    });
}