import type { APIRoute } from "astro";
import { initDB, getChinaTimeString } from "../../../lib/db";

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const db = initDB();
    const activeOnly = url.searchParams.get('active') === 'true';

    let query = 'SELECT * FROM exam_projects';
    const params: any[] = [];

    if (activeOnly) {
      query += ' WHERE is_active = 1';
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.execute(query, params);
    const projects = result.rows;

    return new Response(
      JSON.stringify({
        success: true,
        data: projects,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "获取失败",
        error: error instanceof Error ? error.message : "未知错误",
      }),
      { status: 500 }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { name, description, pass_score, total_score, duration, is_active } = data;

    if (!name) {
      return new Response(
        JSON.stringify({ success: false, message: "请输入考试项目名称" }),
        { status: 400 }
      );
    }

    const db = initDB();
    const result = await db.execute(
      `INSERT INTO exam_projects (name, description, pass_score, total_score, duration, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || '',
        pass_score || 80,
        total_score || 100,
        duration || 60,
        is_active !== undefined ? is_active : 1,
        getChinaTimeString(),
        getChinaTimeString(),
      ]
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "创建成功",
        data: { id: result.lastInsertRowid },
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "创建失败",
        error: error instanceof Error ? error.message : "未知错误",
      }),
      { status: 500 }
    );
  }
};