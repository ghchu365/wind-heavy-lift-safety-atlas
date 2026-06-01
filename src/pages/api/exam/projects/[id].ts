import type { APIRoute } from "astro";
import { initDB, getChinaTimeString } from "../../../../lib/db";

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const db = initDB();

    const projectResult = await db.execute('SELECT * FROM exam_projects WHERE id = ?', [id]);
    const project = projectResult.rows[0];
    if (!project) {
      return new Response(
        JSON.stringify({ success: false, message: "考试项目不存在" }),
        { status: 404 }
      );
    }

    const questionsResult = await db.execute('SELECT * FROM exam_questions WHERE project_id = ? ORDER BY sort_order, id', [id]);
    const questions = questionsResult.rows;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...project,
          questions,
        },
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

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const data = await request.json();
    const { name, description, pass_score, total_score, duration, is_active } = data;

    if (!name) {
      return new Response(
        JSON.stringify({ success: false, message: "请输入考试项目名称" }),
        { status: 400 }
      );
    }

    const db = initDB();
    await db.execute(
      `UPDATE exam_projects SET name = ?, description = ?, pass_score = ?, total_score = ?, duration = ?, is_active = ?, updated_at = ? WHERE id = ?`,
      [
        name,
        description || '',
        pass_score || 80,
        total_score || 100,
        duration || 60,
        is_active !== undefined ? is_active : 1,
        getChinaTimeString(),
        Number(id),
      ]
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "更新成功",
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "更新失败",
        error: error instanceof Error ? error.message : "未知错误",
      }),
      { status: 500 }
    );
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const db = initDB();
    await db.execute('DELETE FROM exam_projects WHERE id = ?', [Number(id)]);

    return new Response(
      JSON.stringify({
        success: true,
        message: "删除成功",
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "删除失败",
        error: error instanceof Error ? error.message : "未知错误",
      }),
      { status: 500 }
    );
  }
};