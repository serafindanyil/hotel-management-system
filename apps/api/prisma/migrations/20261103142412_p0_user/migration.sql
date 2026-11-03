-- CreateEnum
CREATE TYPE "Role" AS ENUM ('GUEST', 'MANAGER');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "firebaseUid" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleChange" (
    "id" UUID NOT NULL,
    "accountId" TEXT NOT NULL,
    "fromRole" "Role" NOT NULL,
    "toRole" "Role" NOT NULL,
    "operator" TEXT NOT NULL,
    "changedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoleChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Hand-written: the Prisma schema language has no check constraints.
-- A stored email is trimmed, lower-cased and non-empty, whoever writes the row.
ALTER TABLE "User"
  ADD CONSTRAINT "User_email_normalised"
  CHECK ("email" IS NULL OR ("email" = lower(btrim("email")) AND "email" <> ''));

-- Every audit row records a real change and names its operator.
ALTER TABLE "RoleChange"
  ADD CONSTRAINT "RoleChange_role_changed" CHECK ("fromRole" <> "toRole"),
  ADD CONSTRAINT "RoleChange_operator_named" CHECK ("operator" <> '');
