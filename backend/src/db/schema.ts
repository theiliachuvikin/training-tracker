import {sql} from "drizzle-orm";
import {check, index, integer, numeric, pgEnum, pgTable, timestamp, uuid, varchar} from "drizzle-orm/pg-core";

export const muscleGroup = pgEnum("muscle_group", [
    "chest", "back", "legs", "shoulders", "biceps", "triceps", "core",
]);

export const exercises = pgTable("exercises", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", {length: 100}).notNull(),
    muscleGroup: muscleGroup("muscle_group").notNull(),
    createdAt: timestamp("created_at", {withTimezone: true}).notNull().defaultNow(),
});

export const workoutSets = pgTable("workout_sets", {
    id: uuid("id").primaryKey().defaultRandom(),
    exerciseId: uuid("exercise_id").notNull().references(() =>
        exercises.id, {onDelete: "restrict"}),
    reps: integer("reps").notNull(),
    weightKg: numeric("weight_kg", {precision: 6, scale: 2, mode: "number"}).notNull(),
    performedAt: timestamp("performed_at", {withTimezone: true}).notNull(),
    createdAt: timestamp("created_at", {withTimezone: true}).notNull().defaultNow(),
}, (t) => [
    index("workout_sets_exercise_performed_idx").on(t.exerciseId, t.performedAt),
    check("workout_sets_reps_positive", sql`${t.reps} between 1 and 1000`),
    check("workout_sets_weight_non_negative", sql`${t.weightKg} >= 0`),
]);