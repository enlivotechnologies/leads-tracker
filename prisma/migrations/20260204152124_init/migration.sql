-- CreateEnum
CREATE TYPE "employee_role" AS ENUM ('EMPLOYEE', 'ADMIN');

-- CreateEnum
CREATE TYPE "designation" AS ENUM ('PRINCIPAL', 'VICE_PRINCIPAL', 'PLACEMENT_OFFICER', 'CSR_COORDINATOR', 'OTHER');

-- CreateEnum
CREATE TYPE "call_type" AS ENUM ('FIRST_CALL', 'FOLLOW_UP');

-- CreateEnum
CREATE TYPE "response_status" AS ENUM ('INTERESTED', 'CALL_LATER', 'NOT_INTERESTED');

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "employee_role" NOT NULL DEFAULT 'EMPLOYEE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "college_name" TEXT NOT NULL,
    "location" TEXT,
    "contact_person" TEXT,
    "designation" "designation",
    "phone" TEXT,
    "call_type" "call_type" NOT NULL DEFAULT 'FIRST_CALL',
    "slot_requested" BOOLEAN NOT NULL DEFAULT false,
    "slot_date" DATE,
    "response_status" "response_status" NOT NULL,
    "remarks" TEXT,
    "admin_remarks" TEXT,
    "is_flagged" BOOLEAN NOT NULL DEFAULT false,
    "follow_up_done" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_user_id_key" ON "employees"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

-- CreateIndex
CREATE INDEX "leads_employee_id_idx" ON "leads"("employee_id");

-- CreateIndex
CREATE INDEX "leads_date_idx" ON "leads"("date");

-- CreateIndex
CREATE INDEX "leads_employee_id_date_idx" ON "leads"("employee_id", "date");

-- CreateIndex
CREATE INDEX "leads_response_status_idx" ON "leads"("response_status");

-- CreateIndex
CREATE INDEX "leads_slot_date_idx" ON "leads"("slot_date");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
