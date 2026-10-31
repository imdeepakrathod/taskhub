/* eslint-disable no-console */
import { prisma } from '../config/database.js'

async function runBenchmark() {
  console.log('⚡ Starting Database Performance Benchmark...\n')

  try {
    // 1. Fetch first available workspace & project
    const project = await prisma.project.findFirst({
      include: { workspace: true },
    })

    if (!project) {
      console.log('❌ No projects found in database. Create a project in UI first.')
      return
    }

    console.log(`📊 Testing with Project: "${project.name}" (ID: ${project.id})`)

    // 2. Run EXPLAIN ANALYZE on Task Query (Status + Position index)
    console.log('\n--- Test 1: Task Listing Query with EXPLAIN ANALYZE ---')
    const taskPlan = await prisma.$queryRawUnsafe<Array<{ 'QUERY PLAN': string }>>(`
      EXPLAIN ANALYZE 
      SELECT * FROM "tasks" 
      WHERE "project_id" = '${project.id}'::uuid 
      ORDER BY "position" ASC;
    `)

    taskPlan.forEach((row) => console.log(row['QUERY PLAN']))

    // 3. Run EXPLAIN ANALYZE on Workspace Activity Log Query (Composite Index: workspaceId + createdAt DESC)
    console.log('\n--- Test 2: Activity Logs Feed Query with EXPLAIN ANALYZE ---')
    const activityPlan = await prisma.$queryRawUnsafe<Array<{ 'QUERY PLAN': string }>>(`
      EXPLAIN ANALYZE 
      SELECT * FROM "activity_logs" 
      WHERE "workspace_id" = '${project.workspaceId}'::uuid 
      ORDER BY "created_at" DESC 
      LIMIT 20;
    `)

    activityPlan.forEach((row) => console.log(row['QUERY PLAN']))

    // 4. Run EXPLAIN ANALYZE on Workspace Search (B-Tree vs ILIKE)
    console.log('\n--- Test 3: Search Query with EXPLAIN ANALYZE ---')
    const searchPlan = await prisma.$queryRawUnsafe<Array<{ 'QUERY PLAN': string }>>(`
      EXPLAIN ANALYZE 
      SELECT * FROM "tasks" 
      WHERE "project_id" = '${project.id}'::uuid 
        AND "title" ILIKE '%task%';
    `)

    searchPlan.forEach((row) => console.log(row['QUERY PLAN']))

    console.log('\n✅ Benchmark complete! Notice "Index Scan" vs "Seq Scan" and execution times.')
  } catch (error) {
    console.error('Benchmark failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

void runBenchmark()
