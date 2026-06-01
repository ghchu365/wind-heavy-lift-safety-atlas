import type { APIRoute } from "astro";
import { verifyAuth } from "../../../lib/auth";
import { initDB } from "../../../lib/db";
import { signFileUrls } from "../../../lib/oss";

export const GET: APIRoute = async ({ params, cookies }) => {
  // 校验登录
  const user = await verifyAuth(cookies);
  if (!user) {
    return new Response(
      JSON.stringify({ success: false, message: "未登录" }),
      { status: 401 }
    );
  }

  try {
    const id = params.id;
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: "参数错误" }),
        { status: 400 }
      );
    }

    const db = initDB();
    const result = await db.execute(
      'SELECT * FROM form_records WHERE id = ?',
      [Number(id)]
    );
    const record = result.rows[0];

    if (!record) {
      return new Response(
        JSON.stringify({ success: false, message: "记录不存在" }),
        { status: 404 }
      );
    }

    // 解析文件列表并生成签名URL（有效期24小时）
    const files = JSON.parse(record.files);
    record.files = signFileUrls(files, 86400);

    return new Response(
      JSON.stringify({
        success: true,
        data: record,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "获取详情失败",
        error: error instanceof Error ? error.message : "未知错误",
      }),
      { status: 500 }
    );
  }
};