import type { APIRoute } from "astro";
import { verifyAuth } from "../../../lib/auth";
import { initDB } from "../../../lib/db";
import { getSignedUrl, getKeyFromUrl } from "../../../lib/oss";
import JSZip from "jszip";

// 从OSS获取文件内容（使用签名URL）
async function fetchFile(ossUrl: string): Promise<Buffer> {
  const key = getKeyFromUrl(ossUrl);
  const signedUrl = getSignedUrl(key, 600); // 签名10分钟有效
  const response = await fetch(signedUrl);
  if (!response.ok) {
    throw new Error(`无法获取文件：${ossUrl}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export const POST: APIRoute = async ({ request, cookies }) => {
  // 校验登录，并且需要管理员权限
  const user = await verifyAuth(cookies);
  if (!user || user.role !== "admin") {
    return new Response(
      JSON.stringify({ success: false, message: "权限不足" }),
      { status: 403 }
    );
  }

  try {
    const { ids } = await request.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "请选择要下载的记录" }),
        { status: 400 }
      );
    }

    const db = initDB();
    const placeholders = ids.map(() => "?").join(",");
    const result = await db.execute(
      `SELECT id, project_name, check_date, operator, files
       FROM form_records
       WHERE id IN (${placeholders})`,
      ids
    );
    const records = result.rows;

    if (records.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "没有找到记录" }),
        { status: 404 }
      );
    }

    // 创建ZIP包
    const zip = new JSZip();

    // 遍历记录，添加文件到ZIP
    for (const record of records) {
      const files = JSON.parse(record.files);
      const folderName = `${record.project_name}_${record.check_date}_${record.operator}`.replace(/[\/\\:*?"<>|]/g, "_");
      const folder = zip.folder(folderName);

      if (!folder) {
        throw new Error("创建ZIP文件夹失败");
      }

      // 下载所有文件并添加到ZIP
      for (const file of files) {
        try {
          const fileName = file.name || `file_${Math.random().toString(36).slice(2, 8)}`;
          const fileContent = await fetchFile(file.url);
          folder.file(fileName, fileContent);
        } catch (error) {
          console.error(`下载文件失败：${file.url}`, error);
          // 继续处理其他文件
        }
      }
    }

    // 生成ZIP文件
    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    // 返回ZIP文件
    const downloadFileName = `安全检查资料_${new Date().toISOString().slice(0, 10)}.zip`;
    const encodedFileName = encodeURIComponent(downloadFileName);

    return new Response(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="safety-records.zip"; filename*=UTF-8''${encodedFileName}`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "打包下载失败",
        error: error instanceof Error ? error.message : "未知错误",
      }),
      { status: 500 }
    );
  }
};