-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('TASK_CREATED', 'TASK_STATUS_CHANGED', 'TASK_PRIORITY_CHANGED', 'TASK_ASSIGNEE_CHANGED', 'TASK_UPDATED', 'TASK_DELETED', 'COMMENT_CREATED');

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "project_id" UUID,
    "actor_id" UUID NOT NULL,
    "action" "ActivityAction" NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" UUID NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_logs_workspace_id_created_at_idx" ON "activity_logs"("workspace_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "activity_logs_project_id_created_at_idx" ON "activity_logs"("project_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
