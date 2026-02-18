import { COOKIE_NAME } from "@shared/const";
import type { Request, Response } from "express";
import type { User } from "../../drizzle/schema";
import * as authService from "../auth.service";
import * as db from "../db";

/**
 * المصادقة المخصصة بدون Manus OAuth
 */
export class CustomAuthService {
  /**
   * المصادقة من خلال رمز الجلسة
   */
  async authenticateRequest(req: Request): Promise<User | null> {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionToken = cookies.get(COOKIE_NAME);

    if (!sessionToken) {
      return null;
    }

    try {
      const user = await authService.getUserFromSession(sessionToken);
      return user;
    } catch (error) {
      console.error("[CustomAuth] Authentication failed:", error);
      return null;
    }
  }

  /**
   * تسجيل الدخول
   */
  async login(
    res: Response,
    email: string,
    password: string
  ): Promise<User | null> {
    try {
      const { userId, sessionToken } = await authService.loginUser(
        email,
        password
      );

      // تعيين رمز الجلسة في الكوكيز
      res.cookie(COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: "/",
      });

      const user = await db.getUserById(userId);
      return user || null;
    } catch (error) {
      console.error("[CustomAuth] Login failed:", error);
      throw error;
    }
  }

  /**
   * تسجيل الخروج
   */
  logout(res: Response, sessionToken?: string): void {
    if (sessionToken) {
      authService.logoutUser(sessionToken).catch((err) =>
        console.error("[CustomAuth] Logout error:", err)
      );
    }

    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }

  /**
   * تحليل الكوكيز
   */
  private parseCookies(
    cookieHeader: string | undefined
  ): Map<string, string> {
    if (!cookieHeader) {
      return new Map<string, string>();
    }

    const parsed: Record<string, string> = {};
    cookieHeader.split(";").forEach((cookie) => {
      const [name, value] = cookie.trim().split("=");
      if (name && value) {
        parsed[name] = decodeURIComponent(value);
      }
    });

    return new Map(Object.entries(parsed));
  }
}

export const customAuth = new CustomAuthService();
