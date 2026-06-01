import type { APIRoute } from "astro";
import { verifyAuth } from "../../../lib/auth";
import { initDB } from "../../../lib/db";

export const GET: APIRoute = async ({ cookies, url }) => {
  // 校验登录
  const user = await verifyAuth(cookies);
  if (!user) {
    return new Response(
      JSON.stringify({ success: false, message: "未登录" }),
      { status: 401 }
    );
  }

  try {
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
    const type = url.searchParams.get("type");
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");

    const offset = (page - 1) * pageSize;

    const db = initDB();

    // 构建查询条件
    let whereClause = "WHERE 1=1";
    let params: any[] = [];

    if (type) {
      whereClause += " AND type = ?";
      params.push(type);
    }

    if (dateFrom) {
      whereClause += " AND check_date >= ?";
      params.push(dateFrom);
    }

    if (dateTo) {
      whereClause += " AND check_date <= ?";
      params.push(dateTo);
    }

    const countParams = [...params];
    params.push(pageSize, offset);

    // 获取数据列表
    const recordsResult = await db.execute(
      `SELECT id, project_name, check_date, logistics_company, operator, type, location, description, created_at
       FROM form_records
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      params
    );
    const records = recordsResult.rows;

    // 获取总数
    const countResult = await db.execute(`SELECT COUNT(*) as total FROM form_records ${whereClause}`, countParams);
    const total = Number(countResult.rows[0]?.total || 0);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          list: records,
          pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
          },
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "获取数据失败",
        error: error instanceof Error ? error.message : "未知错误",
      }),
      { status: 500 }
    );
  }
};