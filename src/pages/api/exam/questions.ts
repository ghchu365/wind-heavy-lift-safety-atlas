import type { APIRoute } from "astro";
import { initDB, getChinaTimeString } from "../../../lib/db";

export const GET: APIRoute = async ({ url }) => {
  try {
    const projectId = url.searchParams.get('project_id');
    if (!projectId) {
      return new Response(
        JSON.stringify({ success: false, message: "请提供考试项目ID" }),
        { status: 400 }
      );
    }

    const db = initDB();
    const questionsResult = await db.execute(
      'SELECT * FROM exam_questions WHERE project_id = ? ORDER BY sort_order, id',
      [Number(projectId)]
    );
    const questions = questionsResult.rows;

    return new Response(
      JSON.stringify({
        success: true,
        data: questions,
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
    const { project_id, type, question, options, answer, score, sort_order } = data;

    if (!project_id || !question || answer === undefined || answer === null) {
      return new Response(
        JSON.stringify({ success: false, message: "请填写完整信息" }),
        { status: 400 }
      );
    }

    const db = initDB();
    const result = await db.execute(
      `INSERT INTO exam_questions (project_id, type, question, options, answer, score, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        project_id,
        type || 'single',
        question,
        JSON.stringify(options || []),
        JSON.stringify(answer),
        score || 4,
        sort_order || 0,
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

export const PUT: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { id, type, question, options, answer, score, sort_order } = data;

    if (!id || !question || answer === undefined || answer === null) {
      return new Response(
        JSON.stringify({ success: false, message: "请填写完整信息" }),
        { status: 400 }
      );
    }

    const db = initDB();
    await db.execute(
      `UPDATE exam_questions SET type = ?, question = ?, options = ?, answer = ?, score = ?, sort_order = ? WHERE id = ?`,
      [
        type || 'single',
        question,
        JSON.stringify(options || []),
        JSON.stringify(answer),
        score || 4,
        sort_order || 0,
        id,
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

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { id } = data;

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: "请提供题目ID" }),
        { status: 400 }
      );
    }

    const db = initDB();
    await db.execute('DELETE FROM exam_questions WHERE id = ?', [id]);

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