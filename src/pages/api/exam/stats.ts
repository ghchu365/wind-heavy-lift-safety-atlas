import type { APIRoute } from "astro";
import { initDB } from "../../../lib/db";

export const GET: APIRoute = async ({ url }) => {
  try {
    const db = initDB();
    const company = url.searchParams.get('company');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');
    const projectId = url.searchParams.get('projectId');

    // 构建基础查询条件
    const conditions: string[] = ['1=1'];
    const params: any[] = [];

    if (company) {
      conditions.push('er.company LIKE ?');
      params.push(`%${company}%`);
    }

    if (dateFrom) {
      conditions.push('DATE(er.created_at) >= ?');
      params.push(dateFrom);
    }

    if (dateTo) {
      conditions.push('DATE(er.created_at) <= ?');
      params.push(dateTo);
    }

    if (projectId) {
      conditions.push('er.project_id = ?');
      params.push(Number(projectId));
    }

    const whereClause = conditions.join(' AND ');

    // 1. 总体统计
    const overallResult = await db.execute(`
      SELECT
        COUNT(*) as total_count,
        SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) as passed_count,
        AVG(score) as avg_score,
        MIN(score) as min_score,
        MAX(score) as max_score,
        AVG(duration) as avg_duration
      FROM exam_records er
      WHERE ${whereClause}
    `, params);
    const overallStats = overallResult.rows[0];

    // 2. 按物流公司统计
    const companyResult = await db.execute(`
      SELECT
        er.company,
        COUNT(*) as total_count,
        SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) as passed_count,
        ROUND(SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as pass_rate,
        ROUND(AVG(score), 2) as avg_score
      FROM exam_records er
      WHERE ${whereClause}
      GROUP BY er.company
      ORDER BY total_count DESC
    `, params);
    const companyStats = companyResult.rows;

    // 3. 按日期统计（每天）
    const dateResult = await db.execute(`
      SELECT
        DATE(er.created_at) as date,
        COUNT(*) as total_count,
        SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) as passed_count,
        ROUND(SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as pass_rate,
        ROUND(AVG(score), 2) as avg_score
      FROM exam_records er
      WHERE ${whereClause}
      GROUP BY DATE(er.created_at)
      ORDER BY date DESC
      LIMIT 30
    `, params);
    const dateStats = dateResult.rows;

    // 4. 按考试项目统计
    const projectResult = await db.execute(`
      SELECT
        er.project_id,
        ep.name as project_name,
        COUNT(*) as total_count,
        SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) as passed_count,
        ROUND(SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as pass_rate,
        ROUND(AVG(score), 2) as avg_score
      FROM exam_records er
      LEFT JOIN exam_projects ep ON er.project_id = ep.id
      WHERE ${whereClause}
      GROUP BY er.project_id, ep.name
      ORDER BY total_count DESC
    `, params);
    const projectStats = projectResult.rows;

    // 5. 获取所有项目列表（用于筛选）
    const projectsResult = await db.execute('SELECT id, name FROM exam_projects WHERE is_active = 1 ORDER BY name');
    const projects = projectsResult.rows;

    // 6. 获取所有物流公司列表（用于筛选）
    const companiesResult = await db.execute('SELECT DISTINCT company FROM exam_records ORDER BY company');
    const companies = companiesResult.rows;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          overall: {
            total_count: overallStats?.total_count || 0,
            passed_count: overallStats?.passed_count || 0,
            pass_rate: overallStats?.total_count > 0
              ? Math.round((Number(overallStats.passed_count) / Number(overallStats.total_count)) * 100)
              : 0,
            avg_score: Math.round(Number(overallStats?.avg_score || 0)),
            min_score: Number(overallStats?.min_score || 0),
            max_score: Number(overallStats?.max_score || 0),
            avg_duration: Math.round(Number(overallStats?.avg_duration || 0)),
          },
          by_company: companyStats,
          by_date: dateStats,
          by_project: projectStats,
          projects,
          companies,
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