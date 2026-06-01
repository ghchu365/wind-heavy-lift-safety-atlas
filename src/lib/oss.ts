import crypto from "crypto";

const OSS_CONFIG = {
  accessKeyId: import.meta.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: import.meta.env.OSS_ACCESS_KEY_SECRET,
  region: import.meta.env.OSS_REGION,
  bucket: import.meta.env.OSS_BUCKET,
};

const OSS_BASE_URL = `https://${OSS_CONFIG.bucket}.${OSS_CONFIG.region}.aliyuncs.com/`;

/**
 * 从完整OSS URL中提取对象key
 * 如 https://bucket.region.aliyuncs.com/uploads/file.png → uploads/file.png
 */
export function getKeyFromUrl(url: string): string {
  return url.replace(OSS_BASE_URL, "");
}

/**
 * 生成OSS签名URL（用于私有读权限的文件访问）
 * @param key OSS对象键（如 uploads/1234-file.png）
 * @param expiresInSeconds 过期时间（秒），默认1小时
 */
export function getSignedUrl(key: string, expiresInSeconds = 3600): string {
  const expiration = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const resource = `/${OSS_CONFIG.bucket}/${key}`;
  const stringToSign = `GET\n\n\n${expiration}\n${resource}`;

  const signature = crypto
    .createHmac("sha1", OSS_CONFIG.accessKeySecret)
    .update(stringToSign)
    .digest("base64");

  return `${OSS_BASE_URL}${key}?OSSAccessKeyId=${OSS_CONFIG.accessKeyId}&Expires=${expiration}&Signature=${encodeURIComponent(signature)}`;
}

/**
 * 为文件记录中的URL全部生成签名URL
 */
export function signFileUrls(files: { url: string; name: string; size?: number; type?: string }[], expiresInSeconds = 3600) {
  return files.map((file) => ({
    ...file,
    url: getSignedUrl(getKeyFromUrl(file.url), expiresInSeconds),
  }));
}
