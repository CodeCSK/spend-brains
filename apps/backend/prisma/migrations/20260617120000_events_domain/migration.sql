-- Events domain: events, event_members, join_requests, event_expense_categories,
-- expenses, expense_shares, settlement_lines + enums.
-- See apps/backend/docs/database/schema.md

-- CreateEnum
CREATE TYPE "event_type" AS ENUM ('general', 'vacation', 'corporate', 'ritual', 'roommate', 'travel', 'party');

-- CreateEnum
CREATE TYPE "event_visibility" AS ENUM ('private', 'public');

-- CreateEnum
CREATE TYPE "member_role" AS ENUM ('captain', 'vice_captain', 'member');

-- CreateEnum
CREATE TYPE "join_request_status" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "public_id" VARCHAR(8) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "location" VARCHAR(300),
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "event_type" "event_type" NOT NULL DEFAULT 'general',
    "cover_image_url" TEXT,
    "visibility" "event_visibility" NOT NULL DEFAULT 'private',
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "captain_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "events_public_id_key" ON "events"("public_id");
CREATE INDEX "events_captain_id_idx" ON "events"("captain_id");

-- CreateTable
CREATE TABLE "event_members" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "member_role" NOT NULL DEFAULT 'member',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "event_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_members_event_id_user_id_key" ON "event_members"("event_id", "user_id");
CREATE INDEX "event_members_user_id_idx" ON "event_members"("user_id");

-- CreateTable
CREATE TABLE "join_requests" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "join_request_status" NOT NULL DEFAULT 'pending',
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "join_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "join_requests_event_id_status_idx" ON "join_requests"("event_id", "status");
CREATE INDEX "join_requests_user_id_idx" ON "join_requests"("user_id");

-- CreateTable
CREATE TABLE "event_expense_categories" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "icon" VARCHAR(50) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "event_expense_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_expense_categories_event_id_idx" ON "event_expense_categories"("event_id");

-- CreateTable
CREATE TABLE "expenses" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "paid_by" UUID NOT NULL,
    "expense_date" DATE NOT NULL,
    "category_id" UUID NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "expenses_event_id_idx" ON "expenses"("event_id");
CREATE INDEX "expenses_category_id_idx" ON "expenses"("category_id");
CREATE INDEX "expenses_paid_by_idx" ON "expenses"("paid_by");

-- CreateTable
CREATE TABLE "expense_shares" (
    "id" UUID NOT NULL,
    "expense_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "expense_shares_expense_id_user_id_key" ON "expense_shares"("expense_id", "user_id");
CREATE INDEX "expense_shares_user_id_idx" ON "expense_shares"("user_id");

-- CreateTable
CREATE TABLE "settlement_lines" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "from_user_id" UUID NOT NULL,
    "to_user_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "is_settled" BOOLEAN NOT NULL DEFAULT false,
    "settled_by" UUID,
    "settled_at" TIMESTAMPTZ(6),
    "computation_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "settlement_lines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "settlement_lines_event_id_idx" ON "settlement_lines"("event_id");
CREATE INDEX "settlement_lines_from_user_id_idx" ON "settlement_lines"("from_user_id");
CREATE INDEX "settlement_lines_to_user_id_idx" ON "settlement_lines"("to_user_id");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_captain_id_fkey" FOREIGN KEY ("captain_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_members" ADD CONSTRAINT "event_members_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "event_members" ADD CONSTRAINT "event_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "join_requests" ADD CONSTRAINT "join_requests_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "join_requests" ADD CONSTRAINT "join_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "join_requests" ADD CONSTRAINT "join_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_expense_categories" ADD CONSTRAINT "event_expense_categories_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_paid_by_fkey" FOREIGN KEY ("paid_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "event_expense_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_shares" ADD CONSTRAINT "expense_shares_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "expense_shares" ADD CONSTRAINT "expense_shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlement_lines" ADD CONSTRAINT "settlement_lines_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "settlement_lines" ADD CONSTRAINT "settlement_lines_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "settlement_lines" ADD CONSTRAINT "settlement_lines_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "settlement_lines" ADD CONSTRAINT "settlement_lines_settled_by_fkey" FOREIGN KEY ("settled_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
