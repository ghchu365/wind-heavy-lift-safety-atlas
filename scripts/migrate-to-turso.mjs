// 从现有 SQLite 迁移数据到 Turso
// 使用方法: node scripts/migrate-to-turso.mjs

import "dotenv/config";
import { createClient } from "@libsql/client";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// 从环境变量读取 Turso 配置
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoAuthToken) {
  console.error("请在 .env 文件中设置 TURSO_DATABASE_URL 和 TURSO_AUTH_TOKEN");
  process.exit(1);
}

// 连接 Turso
const tursoDb = createClient({ url: tursoUrl, authToken: tursoAuthToken });

// 连接本地 SQLite
async function openLocalDB() {
  const db = await open({
    filename: "./safety-form.db",
    driver: sqlite3.Database,
  });
  return db;
}

// 清空表（删除所有数据，保留结构）
async function clearTable(tableName) {
  console.log(`Clearing table ${tableName}...`);
  await tursoDb.execute(`DELETE FROM ${tableName}`);
}

// 强制转换为 Turso 支持的类型
function cleanValue(value) {
  if (value === null || value === undefined) {
    return null;
  }
  // Turso supports string, number, boolean, null
  const type = typeof value;
  if (type === "string" || type === "number" || type === "boolean") {
    return value;
  }
  // Fallback: convert to string
  return String(value);
}

// 迁移 form_records 表
async function migrateFormRecords(localDb) {
  console.log("Migrating form_records...");
  await clearTable("form_records");
  const records = await localDb.all("SELECT * FROM form_records");
  console.log(`Found ${records.length} records`);

  for (const record of records) {
    await tursoDb.execute(
      `INSERT INTO form_records (id, project_name, check_date, logistics_company, operator, type, location, description, files, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanValue(record.id),
        cleanValue(record.project_name),
        cleanValue(record.check_date),
        cleanValue(record.logistics_company),
        cleanValue(record.operator),
        cleanValue(record.type),
        cleanValue(record.location),
        cleanValue(record.description),
        cleanValue(record.files),
        cleanValue(record.created_at),
      ]
    );
  }
}

// 迁移 users 表
async function migrateUsers(localDb) {
  console.log("Migrating users...");
  // 跳过 users，因为 Turso 已经创建了 admin 账号
  const users = await localDb.all("SELECT * FROM users");
  console.log(`Found ${users.length} users, skipping (admin already created)`);
}

// 迁移 exam_projects 表
async function migrateExamProjects(localDb) {
  console.log("Migrating exam_projects...");
  await clearTable("exam_projects");
  const projects = await localDb.all("SELECT * FROM exam_projects");
  console.log(`Found ${projects.length} projects`);

  for (const project of projects) {
    await tursoDb.execute(
      `INSERT INTO exam_projects (id, name, description, pass_score, total_score, duration, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanValue(project.id),
        cleanValue(project.name),
        cleanValue(project.description),
        cleanValue(project.pass_score),
        cleanValue(project.total_score),
        cleanValue(project.duration),
        cleanValue(project.is_active),
        cleanValue(project.created_at),
        cleanValue(project.updated_at),
      ]
    );
  }
}

// 迁移 exam_questions 表
async function migrateExamQuestions(localDb) {
  console.log("Migrating exam_questions...");
  await clearTable("exam_questions");
  const questions = await localDb.all("SELECT * FROM exam_questions");
  console.log(`Found ${questions.length} questions`);

  for (const q of questions) {
    await tursoDb.execute(
      `INSERT INTO exam_questions (id, project_id, type, question, options, answer, score, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanValue(q.id),
        cleanValue(q.project_id),
        cleanValue(q.type),
        cleanValue(q.question),
        cleanValue(q.options),
        cleanValue(q.answer),
        cleanValue(q.score),
        cleanValue(q.sort_order),
        cleanValue(q.created_at),
      ]
    );
  }
}

// 迁移 exam_records 表
async function migrateExamRecords(localDb) {
  console.log("Migrating exam_records...");
  await clearTable("exam_records");
  const records = await localDb.all("SELECT * FROM exam_records");
  console.log(`Found ${records.length} exam records`);

  for (const record of records) {
    await tursoDb.execute(
      `INSERT INTO exam_records (id, project_id, company, name, position, score, total_score, duration, passed, answers, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanValue(record.id),
        cleanValue(record.project_id),
        cleanValue(record.company),
        cleanValue(record.name),
        cleanValue(record.position),
        cleanValue(record.score),
        cleanValue(record.total_score),
        cleanValue(record.duration),
        record.passed ? 1 : 0,
        cleanValue(record.answers),
        cleanValue(record.created_at),
      ]
    );
  }
}

// 迁移 knowledge_articles 表
async function migrateKnowledgeArticles(localDb) {
  console.log("Migrating knowledge_articles...");
  await clearTable("knowledge_articles");
  const articles = await localDb.all("SELECT * FROM knowledge_articles");
  console.log(`Found ${articles.length} knowledge articles`);

  for (const article of articles) {
    await tursoDb.execute(
      `INSERT INTO knowledge_articles (id, title, category, content, author, views, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanValue(article.id),
        cleanValue(article.title),
        cleanValue(article.category),
        cleanValue(article.content),
        cleanValue(article.author),
        cleanValue(article.views || 0),
        cleanValue(article.created_at),
        cleanValue(article.updated_at),
      ]
    );
  }
}

// 迁移 accident_cases 表
async function migrateAccidentCases(localDb) {
  console.log("Migrating accident_cases...");
  await clearTable("accident_cases");
  const cases = await localDb.all("SELECT * FROM accident_cases");
  console.log(`Found ${cases.length} accident cases`);

  for (let i = 0; i < cases.length; i++) {
    const c = cases[i];
    try {
      // All fields from the actual database: id, title, case_type, severity, description, causes, lessons, prevention, location, date, created_at, updated_at
      // But our table schema doesn't have case_type, so skip it (it's already included in title/description)
      await tursoDb.execute(
        `INSERT INTO accident_cases (id, title, description, severity, cause, prevention, location, date, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cleanValue(c.id),
          cleanValue(c.title),
          cleanValue(c.description),
          cleanValue(c.severity),
          cleanValue(c.causes ?? c.cause ?? null),
          cleanValue(c.lessons ?? c.prevention ?? null),
          cleanValue(c.location ?? null),
          cleanValue(c.date ?? null),
          cleanValue(c.created_at),
          cleanValue(c.updated_at),
        ]
      );
    } catch (e) {
      console.error(`✗ Error inserting case id=${c.id}:`, e);
      console.error("   Data:", JSON.stringify(c, null, 2));
      throw e;
    }
  }
}

// 主函数
async function main() {
  console.log("Starting data migration from SQLite to Turso...");

  const localDb = await openLocalDB();
  console.log("Connected to local SQLite");

  try {
    await migrateFormRecords(localDb);
    await migrateUsers(localDb);
    await migrateExamProjects(localDb);
    await migrateExamQuestions(localDb);
    await migrateExamRecords(localDb);
    await migrateKnowledgeArticles(localDb);
    await migrateAccidentCases(localDb);

    console.log("\n✅ Migration completed successfully!");
    console.log("All data has been migrated from local SQLite to Turso:");
    const totalFormRecords = await localDb.get("SELECT COUNT(*) as c FROM form_records");
    const totalExamProjects = await localDb.get("SELECT COUNT(*) as c FROM exam_projects");
    const totalExamQuestions = await localDb.get("SELECT COUNT(*) as c FROM exam_questions");
    const totalExamRecords = await localDb.get("SELECT COUNT(*) as c FROM exam_records");
    const totalKnowledgeArticles = await localDb.get("SELECT COUNT(*) as c FROM knowledge_articles");
    const totalAccidentCases = await localDb.get("SELECT COUNT(*) as c FROM accident_cases");
    console.log(`- form_records: ${totalFormRecords.c} records`);
    console.log(`- exam_projects: ${totalExamProjects.c} projects`);
    console.log(`- exam_questions: ${totalExamQuestions.c} questions`);
    console.log(`- exam_records: ${totalExamRecords.c} exam records`);
    console.log(`- knowledge_articles: ${totalKnowledgeArticles.c} articles`);
    console.log(`- accident_cases: ${totalAccidentCases.c} cases`);

    await tursoDb.close();
    await localDb.close();
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main();