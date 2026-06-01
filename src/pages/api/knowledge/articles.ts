import type { APIRoute } from "astro";
import { initDB } from "../../../lib/db";

export const GET: APIRoute = async ({ url }) => {
  try {
    const db = initDB();
    const category = url.searchParams.get('category');

    let query = 'SELECT * FROM knowledge_articles';
    const params: any[] = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.execute(query, params);
    const articles = result.rows;

    return new Response(
      JSON.stringify({
        success: true,
        data: articles,
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
