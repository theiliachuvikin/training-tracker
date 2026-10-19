import {pgEnum, pgTable, timestamp, uuid, varchar} from "drizzle-orm/pg-core";

export const muscleGroup = pgEnum("muscle_group", [
    "chest", "back", "legs", "shoulders", "biceps", "triceps", "core",
]);

export const exercises = pgTable("exercises", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", {length: 100}).notNull(),
    muscleGroup: muscleGroup("muscle_group").notNull(),
    createdAt: timestamp("created_at", {withTimezone: true}).notNull().defaultNow(),
})