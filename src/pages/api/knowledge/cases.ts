import type { APIRoute } from "astro";
import { initDB } from "../../../lib/db";

export const GET: APIRoute = async ({ url }) => {
  try {
    const db = initDB();
    const severity = url.searchParams.get('severity');

    let query = 'SELECT * FROM accident_cases';
    const params: any[] = [];

    if (severity) {
      query += ' WHERE severity = ?';
      params.push(severity);
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.execute(query, params);
    const cases = result.rows;

    return new Response(
      JSON.stringify({
        success: true,
        data: cases,
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
