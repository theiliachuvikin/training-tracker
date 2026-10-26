CREATE TABLE "workout_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exerciseId" uuid NOT NULL,
	"reps" integer NOT NULL,
	"weight_kg" numeric(6, 2) NOT NULL,
	"performed_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workout_sets_reps_positive" CHECK ("workout_sets"."reps" between 1 and 1000),
	CONSTRAINT "workout_sets_weight_non_negative" CHECK ("workout_sets"."weight_kg" >= 0)
);
--> statement-breakpoint
ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_exerciseId_exercises_id_fk" FOREIGN KEY ("exerciseId") REFERENCES "public"."exercises"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "workout_sets_exercise_performed_idx" ON "workout_sets" USING btree ("exerciseId","performed_at");