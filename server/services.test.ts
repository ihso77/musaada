import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockContext(): TrpcContext {
  return {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("services", () => {
  it("should list all services", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const services = await caller.services.list();

    expect(Array.isArray(services)).toBe(true);
    expect(services.length).toBeGreaterThan(0);
    
    // Check first service structure
    if (services.length > 0) {
      const service = services[0];
      expect(service).toHaveProperty("id");
      expect(service).toHaveProperty("nameAr");
      expect(service).toHaveProperty("nameEn");
      expect(service).toHaveProperty("category");
      expect(service).toHaveProperty("basePrice");
      expect(service.isActive).toBe(true);
    }
  });

  it("should get service by id", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // First get all services to get a valid ID
    const services = await caller.services.list();
    
    if (services.length > 0) {
      const serviceId = services[0]!.id;
      const service = await caller.services.getById({ id: serviceId });

      expect(service).toBeDefined();
      expect(service?.id).toBe(serviceId);
      expect(service?.nameAr).toBeDefined();
    }
  });
});
