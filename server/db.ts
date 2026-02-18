import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  services, Service, InsertService,
  providers, Provider, InsertProvider,
  bookings, Booking, InsertBooking,
  reviews, Review, InsertReview,
  notifications, Notification, InsertNotification
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    // For OAuth users, we need email
    const values: InsertUser = {
      openId: user.openId,
      email: user.email || `oauth-${user.openId}@musaada.local`,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "loginMethod", "phone", "avatar", "bio", "address", "city"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (user.isVerified !== undefined) {
      values.isVerified = user.isVerified;
      updateSet.isVerified = user.isVerified;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Services
export async function getAllServices() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(services).where(eq(services.isActive, true));
}

export async function getServiceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createService(service: InsertService) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(services).values(service);
  return result;
}

// Providers
export async function getProvidersByService(serviceId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      provider: providers,
      user: users,
      service: services,
    })
    .from(providers)
    .leftJoin(users, eq(providers.userId, users.id))
    .leftJoin(services, eq(providers.serviceId, services.id))
    .where(and(
      eq(providers.serviceId, serviceId),
      eq(providers.isVerified, true),
      eq(providers.isAvailable, true)
    ));
}

export async function getProviderByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(providers).where(eq(providers.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProvider(provider: InsertProvider) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(providers).values(provider);
  return result;
}

// Bookings
export async function getBookingsByCustomer(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      booking: bookings,
      provider: providers,
      providerUser: users,
      service: services,
    })
    .from(bookings)
    .leftJoin(providers, eq(bookings.providerId, providers.id))
    .leftJoin(users, eq(providers.userId, users.id))
    .leftJoin(services, eq(bookings.serviceId, services.id))
    .where(eq(bookings.customerId, customerId))
    .orderBy(desc(bookings.createdAt));
}

export async function getBookingsByProvider(providerId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      booking: bookings,
      customer: users,
      service: services,
    })
    .from(bookings)
    .leftJoin(users, eq(bookings.customerId, users.id))
    .leftJoin(services, eq(bookings.serviceId, services.id))
    .where(eq(bookings.providerId, providerId))
    .orderBy(desc(bookings.createdAt));
}

export async function createBooking(booking: InsertBooking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bookings).values(booking);
  return result;
}

export async function updateBookingStatus(bookingId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(bookings).set({ status: status as any }).where(eq(bookings.id, bookingId));
}

// Reviews
export async function getReviewsByProvider(providerId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      review: reviews,
      customer: users,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.customerId, users.id))
    .where(eq(reviews.providerId, providerId))
    .orderBy(desc(reviews.createdAt));
}

export async function createReview(review: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(reviews).values(review);
  
  // Update provider rating
  const allReviews = await db.select().from(reviews).where(eq(reviews.providerId, review.providerId));
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  
  await db.update(providers)
    .set({ 
      rating: avgRating.toFixed(2),
      totalReviews: allReviews.length 
    })
    .where(eq(providers.id, review.providerId));
  
  return result;
}

// Notifications
export async function getNotificationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
}

export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(notifications).values(notification);
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notificationId));
}
