import type { APIRoute } from "astro";
import crypto from "crypto";

const OSS_CONFIG = {
  accessKeyId: import.meta.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: import.meta.env.OSS_ACCESS_KEY_SECRET,
  region: import.meta.env.OSS_REGION,
  bucket: import.meta.env.OSS_BUCKET,
};

// 生成OSS上传签名（PostObject方式）
export const POST: APIRoute = async ({ request }) => {
  try {
    const { fileName: originalName } = await request.json();

    // 生成唯一文件名，避免重名
    const fileExt = originalName.split(".").pop();
    const fileName = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

    // 配置签名过期时间，默认1小时
    const expireTime = Date.now() + 3600 * 1000;
    const expiration = new Date(expireTime).toISOString();

    // 构造Policy
    const policy = {
      expiration,
      conditions: [
        ["content-length-range", 0, 50 * 1024 * 1024], // 限制文件大小50MB
        ["eq", "$key", fileName],
      ],
    };

    const policyBase64 = Buffer.from(JSON.stringify(policy)).toString("base64");
    const signature = crypto
      .createHmac("sha1", OSS_CONFIG.accessKeySecret)
      .update(policyBase64)
      .digest("base64");

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          url: `https://${OSS_CONFIG.bucket}.${OSS_CONFIG.region}.aliyuncs.com`,
          key: fileName,
          policy: policyBase64,
          OSSAccessKeyId: OSS_CONFIG.accessKeyId,
          signature,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "签名生成失败",
        error: error instanceof Error ? error.message : "未知错误",
      }),
      { status: 500 }
    );
  }
};