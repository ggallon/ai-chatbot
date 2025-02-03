CREATE TYPE "public"."visibility" AS ENUM('public', 'private');--> statement-breakpoint
ALTER TABLE "Chat" ADD COLUMN "visibilityN" "visibility" DEFAULT 'private' NOT NULL;