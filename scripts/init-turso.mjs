// 初始化 Turso 数据库 schema
// 使用方法: node scripts/init-turso.mjs

import "dotenv/config";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

// 从环境变量读取配置
const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("请在 .env 文件中设置 TURSO_DATABASE_URL 和 TURSO_AUTH_TOKEN");
  process.exit(1);
}

const db = createClient({ url, authToken });

async function initSchema() {
  console.log("正在创建数据库 schema...");

  // Turso HTTP API 一次只能执行一条语句，需要逐个创建
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
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
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
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS exam_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      type TEXT NOT NULL DEFAULT 'single',
      question TEXT NOT NULL,
      options TEXT,
      answer TEXT NOT NULL,
      score INTEGER NOT NULL DEFAULT 4,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS knowledge_articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      author TEXT DEFAULT '系统',
      views INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
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
    )
  `);

  console.log("Schema 创建完成");

  // 初始化默认管理员账号
  const existingAdmin = await db.execute('SELECT * FROM users WHERE username = ?', ['admin']);

  if (existingAdmin.rows.length === 0) {
    console.log("正在创建默认管理员账号...");
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.execute(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      ['admin', hashedPassword, 'admin']
    );
    console.log("默认管理员账号创建完成 (用户名: admin, 密码: admin123)");
  } else {
    console.log("管理员账号已存在，跳过创建");
  }
}

async function importExistingData() {
  console.log("\n是否要导入现有 SQLite 数据到 Turso？");
  console.log("该功能需要手动启用，请修改此脚本开启导入功能。");
}

async function main() {
  try {
    await initSchema();
    await importExistingData();
    console.log("\n初始化完成！");
    await db.close();
  } catch (error) {
    console.error("初始化失败:", error);
    process.exit(1);
  }
}

main();