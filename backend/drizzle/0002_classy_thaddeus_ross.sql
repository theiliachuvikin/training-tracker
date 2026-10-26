ALTER TABLE "workout_sets" RENAME COLUMN "exerciseId" TO "exercise_id";--> statement-breakpoint
ALTER TABLE "workout_sets" DROP CONSTRAINT "workout_sets_exerciseId_exercises_id_fk";
--> statement-breakpoint
DROP INDEX "workout_sets_exercise_performed_idx";--> statement-breakpoint
ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "workout_sets_exercise_performed_idx" ON "workout_sets" USING btree ("exercise_id","performed_at");