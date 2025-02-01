CREATE TYPE "public"."documentkind" AS ENUM('text', 'image', 'code');--> statement-breakpoint
ALTER TABLE "Document" ADD COLUMN "kindNext" "documentkind" DEFAULT 'text' NOT NULL;