import type { APIRoute } from "astro";
import { initDB } from "../../../../lib/db";

export const GET: APIRoute = async ({ params }) => {
  try {
    const db = initDB();
    const id = params.id;

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: "请提供文章ID" }),
        { status: 400 }
      );
    }

    const result = await db.execute('SELECT * FROM knowledge_articles WHERE id = ?', [Number(id)]);
    const article = result.rows[0];

    if (!article) {
      return new Response(
        JSON.stringify({ success: false, message: "文章不存在" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: article,
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
