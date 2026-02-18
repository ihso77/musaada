import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { users, emailVerificationTokens, sessions } from "../drizzle/schema";
import { nanoid } from "nanoid";
import * as emailService from "./email.service";

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * تجزئة كلمة المرور
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * التحقق من كلمة المرور
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * إنشاء رمز التحقق من البريد الإلكتروني
 */
export function generateVerificationToken(): string {
  return nanoid(6).toUpperCase();
}

/**
 * إنشاء رمز الجلسة
 */
export function generateSessionToken(): string {
  return nanoid(64);
}

/**
 * تسجيل مستخدم جديد
 */
export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<{ userId: number; verificationToken: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // التحقق من عدم وجود المستخدم
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("البريد الإلكتروني مستخدم بالفعل");
  }

  // تجزئة كلمة المرور
  const hashedPassword = await hashPassword(password);

  // إنشاء المستخدم
  const result = await db.insert(users).values({
    email,
    password: hashedPassword,
    name,
    emailVerified: false,
    role: "user",
    loginMethod: "email",
  });

  const userId = (result as any).insertId;

  // إنشاء رمز التحقق
  const verificationToken = generateVerificationToken();
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY);

  await db.insert(emailVerificationTokens).values({
    userId,
    token: verificationToken,
    expiresAt,
  });

  // إرسال البريد الإلكتروني
  const verificationUrl = `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/verify-email?userId=${userId}&token=${verificationToken}`;
  
  try {
    await emailService.sendVerificationEmail(
      email,
      name,
      verificationToken,
      verificationUrl
    );
  } catch (error) {
    console.error("[Auth] Failed to send verification email:", error);
    // لا نرمي خطأ هنا لأن المستخدم تم إنشاؤه بنجاح
  }

  return { userId, verificationToken };
}

/**
 * تسجيل الدخول
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ userId: number; sessionToken: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // البحث عن المستخدم
  const userList = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (userList.length === 0) {
    throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
  }

  const user = userList[0];

  // التحقق من كلمة المرور
  if (!user.password) {
    throw new Error("هذا الحساب لم يتم تفعيله بعد");
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
  }

  // إنشاء جلسة
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY);

  await db.insert(sessions).values({
    userId: user.id,
    token: sessionToken,
    expiresAt,
  });

  // تحديث آخر تسجيل دخول
  await db
    .update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, user.id));

  return { userId: user.id, sessionToken };
}

/**
 * التحقق من رمز البريد الإلكتروني
 */
export async function verifyEmailToken(
  userId: number,
  token: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // البحث عن الرمز
  const tokenList = await db
    .select()
    .from(emailVerificationTokens)
    .where(eq(emailVerificationTokens.token, token))
    .limit(1);

  if (tokenList.length === 0) {
    throw new Error("رمز التحقق غير صحيح");
  }

  const tokenRecord = tokenList[0];

  // التحقق من انتهاء الصلاحية
  if (new Date() > tokenRecord.expiresAt) {
    throw new Error("انتهت صلاحية رمز التحقق");
  }

  // التحقق من أن الرمز يخص هذا المستخدم
  if (tokenRecord.userId !== userId) {
    throw new Error("رمز التحقق غير صحيح");
  }

  // تحديث المستخدم
  await db
    .update(users)
    .set({ emailVerified: true })
    .where(eq(users.id, userId));

  // حذف الرمز
  await db
    .delete(emailVerificationTokens)
    .where(eq(emailVerificationTokens.token, token));

  return true;
}

/**
 * الحصول على المستخدم من رمز الجلسة
 */
export async function getUserFromSession(
  sessionToken: string
): Promise<(typeof users.$inferSelect) | null> {
  const db = await getDb();
  if (!db) return null;

  // البحث عن الجلسة
  const sessionList = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, sessionToken))
    .limit(1);

  if (sessionList.length === 0) {
    return null;
  }

  const session = sessionList[0];

  // التحقق من انتهاء الصلاحية
  if (new Date() > session.expiresAt) {
    await db.delete(sessions).where(eq(sessions.token, sessionToken));
    return null;
  }

  // الحصول على المستخدم
  const userList = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return userList.length > 0 ? userList[0] : null;
}

/**
 * تسجيل الخروج
 */
export async function logoutUser(sessionToken: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(sessions).where(eq(sessions.token, sessionToken));
}

/**
 * إرسال إشعار تأكيد الحجز
 */
export async function sendBookingConfirmation(
  email: string,
  customerName: string,
  serviceName: string,
  bookingDate: string,
  bookingTime: string,
  totalPrice: string
): Promise<void> {
  try {
    await emailService.sendBookingConfirmationEmail(
      email,
      customerName,
      serviceName,
      bookingDate,
      bookingTime,
      totalPrice
    );
  } catch (error) {
    console.error("[Auth] Failed to send booking confirmation:", error);
  }
}

/**
 * إرسال إشعار تغيير حالة الحجز
 */
export async function sendBookingStatusChange(
  email: string,
  customerName: string,
  serviceName: string,
  status: string,
  statusMessage: string
): Promise<void> {
  try {
    await emailService.sendBookingStatusChangeEmail(
      email,
      customerName,
      serviceName,
      status,
      statusMessage
    );
  } catch (error) {
    console.error("[Auth] Failed to send booking status change:", error);
  }
}

/**
 * إرسال إشعار تقييم جديد
 */
export async function sendNewReviewNotification(
  email: string,
  providerName: string,
  customerName: string,
  rating: number,
  comment: string
): Promise<void> {
  try {
    await emailService.sendNewReviewNotificationEmail(
      email,
      providerName,
      customerName,
      rating,
      comment
    );
  } catch (error) {
    console.error("[Auth] Failed to send review notification:", error);
  }
}
