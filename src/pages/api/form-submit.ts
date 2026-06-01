import type { APIRoute } from "astro";
import { initDB, getChinaTimeString } from "../../lib/db";

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.json();
    const {
      project_name,
      check_date,
      logistics_company,
      operator,
      type,
      location,
      description,
      files,
    } = formData;

    // 简单校验
    if (!project_name || !check_date || !logistics_company || !operator || !type || !location || !description || !files) {
      return new Response(
        JSON.stringify({ success: false, message: "请填写完整信息" }),
        { status: 400 }
      );
    }

    const db = initDB();

    // 插入数据
    const result = await db.execute(
      `INSERT INTO form_records (
        project_name, check_date, logistics_company, operator, type, location, description, files, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        project_name,
        check_date,
        logistics_company,
        operator,
        type,
        location,
        description,
        JSON.stringify(files),
        getChinaTimeString(),
      ]
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "提交成功",
        data: {
          id: result.lastInsertRowid,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "提交失败",
        error: error instanceof Error ? error.message : "未知错误",
      }),
      { status: 500 }
    );
  }
};