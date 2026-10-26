import {z} from "zod";

export const createWorkoutSetSchema = z.object({
    reps: z.number().int().min(1).max(1000),
    weightKg: z.number().min(0).max(9999.99).multipleOf(0.01),
    performedAt: z.iso.datetime({offset: true}),

});

export const exerciseIdParamSchema = z.object({
    id: z.uuid(),
});

export type CreateWorkoutSetInput = z.infer<typeof createWorkoutSetSchema>;

