import type { APIRoute } from "astro";
import { initDB } from "../../../lib/db";

const JWT_SECRET = import.meta.env.JWT_SECRET || "your-secret-key-change-in-production";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ success: false, message: "请输入用户名和密码" }),
        { status: 400 }
      );
    }

    const db = initDB();
    const result = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    const user = result.rows[0];

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: "用户名或密码错误" }),
        { status: 401 }
      );
    }

    // 验证密码（动态导入，避免Vite SSR编译问题）
    const bcrypt = await import("bcryptjs");
    const isPasswordValid = await bcrypt.default.compare(password, user.password);
    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({ success: false, message: "用户名或密码错误" }),
        { status: 401 }
      );
    }

    // 生成JWT token（动态导入）
    const jwt = await import("jsonwebtoken");
    const token = jwt.default.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    cookies.set("auth_token", token, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "登录成功",
        data: {
          username: user.username,
          role: user.role,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "登录失败",
        error: error instanceof Error ? error.message : "未知错误",
      }),
      { status: 500 }
    );
  }
};