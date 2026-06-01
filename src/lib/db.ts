import { createClient } from "@libsql/client";
import type { Client } from "@libsql/client";

let cachedClient: Client | null = null;

// 获取中国本地时间字符串（YYYY-MM-DD HH:mm:ss）
export function getChinaTimeString() {
  const now = new Date();
  const chinaTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return chinaTime.toISOString().slice(0, 19).replace("T", " ");
}

export function initDB(): Client {
  if (cachedClient) {
    return cachedClient;
  }

  const url = import.meta.env.TURSO_DATABASE_URL;
  const authToken = import.meta.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in environment variables");
  }

  cachedClient = createClient({
    url,
    authToken,
  });

  return cachedClient;
}

export async function closeDB() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
  }
}

export async function initSchema() {
  const db = initDB();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS form_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_name TEXT NOT NULL,
      check_date TEXT NOT NULL,
      logistics_company TEXT NOT NULL,
      operator TEXT NOT NULL,
      type TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT NOT NULL,
      files TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 考试项目表
    CREATE TABLE IF NOT EXISTS exam_projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      pass_score INTEGER NOT NULL DEFAULT 80,
      total_score INTEGER NOT NULL DEFAULT 100,
      duration INTEGER NOT NULL DEFAULT 60,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 考试题目表
    CREATE TABLE IF NOT EXISTS exam_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      type TEXT NOT NULL DEFAULT 'single',
      question TEXT NOT NULL,
      options TEXT,
      answer TEXT NOT NULL,
      score INTEGER NOT NULL DEFAULT 4,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES exam_projects(id) ON DELETE CASCADE
    );

    -- 考试记录表
    CREATE TABLE IF NOT EXISTS exam_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      company TEXT NOT NULL,
      name TEXT NOT NULL,
      position TEXT,
      score INTEGER NOT NULL,
      total_score INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      passed BOOLEAN NOT NULL,
      answers TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES exam_projects(id)
    );

    -- 知识库文章表
    CREATE TABLE IF NOT EXISTS knowledge_articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      author TEXT DEFAULT '系统',
      views INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 事故案例表
    CREATE TABLE IF NOT EXISTS accident_cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      severity TEXT NOT NULL,
      cause TEXT,
      prevention TEXT,
      location TEXT,
      date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}