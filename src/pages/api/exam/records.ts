import type { APIRoute } from "astro";
import { initDB, getChinaTimeString } from "../../../lib/db";

export const GET: APIRoute = async ({ url }) => {
  try {
    const db = initDB();
    const company = url.searchParams.get('company');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');
    const projectId = url.searchParams.get('projectId');
    const name = url.searchParams.get('name');
    const limit = url.searchParams.get('limit');

    let query = `
      SELECT er.*, ep.name as project_name
      FROM exam_records er
      LEFT JOIN exam_projects ep ON er.project_id = ep.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (company) {
      query += ' AND er.company LIKE ?';
      params.push(`%${company}%`);
    }

    if (name) {
      query += ' AND er.name LIKE ?';
      params.push(`%${name}%`);
    }

    if (dateFrom) {
      query += ' AND DATE(er.created_at) >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      query += ' AND DATE(er.created_at) <= ?';
      params.push(dateTo);
    }

    if (projectId) {
      query += ' AND er.project_id = ?';
      params.push(Number(projectId));
    }

    query += ' ORDER BY er.created_at DESC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    const result = await db.execute(query, params);
    const records = result.rows;

    return new Response(
      JSON.stringify({
        success: true,
        data: records,
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
    const { project_id, company, name, position, score, total_score, duration, passed, answers } = data;

    if (!project_id || !company || !name || score === undefined || total_score === undefined || duration === undefined || passed === undefined) {
      return new Response(
        JSON.stringify({ success: false, message: "请填写完整信息" }),
        { status: 400 }
      );
    }

    const db = initDB();
    const result = await db.execute(
      `INSERT INTO exam_records (project_id, company, name, position, score, total_score, duration, passed, answers, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        project_id,
        company,
        name,
        position || '',
        score,
        total_score,
        duration,
        passed ? 1 : 0,
        JSON.stringify(answers || {}),
        getChinaTimeString(),
      ]
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "保存成功",
        data: { id: result.lastInsertRowid },
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "保存失败",
        error: error instanceof Error ? error.message : "未知错误",
      }),
      { status: 500 }
    );
  }
};