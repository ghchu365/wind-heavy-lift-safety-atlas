import type { AstroCookies } from "astro";

const JWT_SECRET = import.meta.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface User {
  userId: number;
  username: string;
  role: string;
}

// 校验登录状态
export async function verifyAuth(cookies: AstroCookies): Promise<User | null> {
  const token = cookies.get("auth_token")?.value;
  if (!token) {
    return null;
  }

  try {
    const jwt = await import("jsonwebtoken");
    const decoded = jwt.default.verify(token, JWT_SECRET) as User;
    return decoded;
  } catch (error) {
    return null;
  }
}

// 校验是否是管理员
export function isAdmin(user: User | null): boolean {
  return user?.role === "admin";
}