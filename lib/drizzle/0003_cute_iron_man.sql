ALTER TABLE "Suggestion" DROP CONSTRAINT "Suggestion_id_pk";--> statement-breakpoint
ALTER TABLE "Suggestion" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "Suggestion" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Chat" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Document" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Document" ALTER COLUMN "id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "Message" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_email_unique" UNIQUE("email");