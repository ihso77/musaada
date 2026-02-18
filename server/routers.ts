import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import * as authService from "./auth.service";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    register: publicProcedure
      .input(z.object({
        email: z.string().email("البريد الإلكتروني غير صحيح"),
        password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
        name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
      }))
      .mutation(async ({ input }) => {
        try {
          const { userId, verificationToken } = await authService.registerUser(
            input.email,
            input.password,
            input.name
          );
          
          // TODO: إرسال البريد الإلكتروني برمز التحقق
          console.log(`Verification token for ${input.email}: ${verificationToken}`);
          
          return {
            success: true,
            message: "تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني",
            userId,
          };
        } catch (error: any) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message || "فشل إنشاء الحساب",
          });
        }
      }),
    
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { userId, sessionToken } = await authService.loginUser(
            input.email,
            input.password
          );
          
          // تعيين رمز الجلسة في الكوكيز
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, {
            ...cookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          });
          
          const user = await db.getUserById(userId);
          
          return {
            success: true,
            user,
          };
        } catch (error: any) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: error.message || "فشل تسجيل الدخول",
          });
        }
      }),
    
    verifyEmail: publicProcedure
      .input(z.object({
        userId: z.number(),
        token: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          await authService.verifyEmailToken(input.userId, input.token);
          return {
            success: true,
            message: "تم التحقق من البريد الإلكتروني بنجاح",
          };
        } catch (error: any) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message || "فشل التحقق من البريد الإلكتروني",
          });
        }
      }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
    
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        avatar: z.string().optional(),
        bio: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db_module = await import("./db");
        // Update user in database
        return { success: true };
      }),
  }),

  services: router({
    list: publicProcedure.query(async () => {
      return await db.getAllServices();
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getServiceById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        nameAr: z.string(),
        nameEn: z.string(),
        descriptionAr: z.string(),
        descriptionEn: z.string(),
        category: z.enum(["cleaning", "hospitality", "gardening", "other"]),
        basePrice: z.string(),
        priceUnit: z.string().default("hour"),
      }))
      .mutation(async ({ input }) => {
        return await db.createService({
          nameAr: input.nameAr,
          nameEn: input.nameEn,
          descriptionAr: input.descriptionAr,
          descriptionEn: input.descriptionEn,
          category: input.category,
          basePrice: input.basePrice,
          priceUnit: input.priceUnit,
          isActive: true,
        });
      }),
  }),

  providers: router({
    listByService: publicProcedure
      .input(z.object({ serviceId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProvidersByService(input.serviceId);
      }),
    
    getByUserId: protectedProcedure.query(async ({ ctx }) => {
      return await db.getProviderByUserId(ctx.user.id);
    }),
  }),

  bookings: router({
    create: protectedProcedure
      .input(z.object({
        providerId: z.number(),
        serviceId: z.number(),
        bookingDate: z.date(),
        startTime: z.string(),
        duration: z.number(),
        address: z.string(),
        city: z.string(),
        notes: z.string().optional(),
        totalPrice: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createBooking({
          customerId: ctx.user.id,
          providerId: input.providerId,
          serviceId: input.serviceId,
          bookingDate: input.bookingDate,
          startTime: input.startTime,
          duration: input.duration,
          address: input.address,
          city: input.city,
          notes: input.notes,
          totalPrice: input.totalPrice,
          status: "pending",
        });
      }),
    
    listByCustomer: protectedProcedure.query(async ({ ctx }) => {
      return await db.getBookingsByCustomer(ctx.user.id);
    }),
    
    listByProvider: protectedProcedure.query(async ({ ctx }) => {
      const provider = await db.getProviderByUserId(ctx.user.id);
      if (!provider) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "لم يتم العثور على ملف مقدم الخدمة",
        });
      }
      return await db.getBookingsByProvider(provider.id);
    }),
    
    updateStatus: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        status: z.enum(["pending", "confirmed", "in_progress", "completed", "cancelled"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateBookingStatus(input.bookingId, input.status);
        return { success: true };
      }),
  }),

  reviews: router({
    listByProvider: publicProcedure
      .input(z.object({ providerId: z.number() }))
      .query(async ({ input }) => {
        return await db.getReviewsByProvider(input.providerId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        providerId: z.number(),
        serviceId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createReview({
          bookingId: input.bookingId,
          customerId: ctx.user.id,
          providerId: input.providerId,
          serviceId: input.serviceId,
          rating: input.rating,
          comment: input.comment,
        });
      }),
  }),

  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getNotificationsByUser(ctx.user.id);
    }),
    
    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.notificationId);
        return { success: true };
      }),
  }),

  admin: router({
    getUsers: adminProcedure.query(async () => {
      // TODO: Implement get all users
      return [];
    }),
    
    getBookings: adminProcedure.query(async () => {
      // TODO: Implement get all bookings
      return [];
    }),
    
    getStatistics: adminProcedure.query(async () => {
      // TODO: Implement get statistics
      return {};
    }),
  }),
});

export type AppRouter = typeof appRouter;
