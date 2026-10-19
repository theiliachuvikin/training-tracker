CREATE TYPE "public"."muscle_group" AS ENUM('chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'core');--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"muscle_group" "muscle_group" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
