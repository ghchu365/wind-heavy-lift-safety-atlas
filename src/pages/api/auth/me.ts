import type { APIRoute } from "astro";
import { verifyAuth } from "../../../lib/auth";

export const GET: APIRoute = async ({ cookies }) => {
  const user = await verifyAuth(cookies);

  if (!user) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "未登录",
      }),
      { status: 401 }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: user,
    }),
    { status: 200 }
  );
};