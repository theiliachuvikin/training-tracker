import {z} from "zod";

export const createExerciseSchema = z.object({
    name: z.string().trim().min(1).max(100),
    muscleGroup: z.enum(["chest", "back", "legs", "shoulders", "biceps", "triceps", "core"]),
});

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;

export type Exercise = CreateExerciseInput & {
  id: string;
  createdAt: string;
};