import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Search, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Services() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  const { data: services, isLoading } = trpc.services.list.useQuery();

  const categoryIcons: Record<string, string> = {
    cleaning: "🧹",
    hospitality: "☕",
    gardening: "🌱",
    other: "🔧",
  };

  const categoryNames: Record<string, string> = {
    all: "جميع الفئات",
    cleaning: "التنظيف",
    hospitality: "الضيافة",
    gardening: "البستنة والزراعة",
    other: "أخرى",
  };

  const filteredServices = services?.filter((service) => {
    const matchesSearch = service.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b bg-muted/30 py-12">
        <div className="container">
          <h1 className="mb-4 text-4xl font-bold">تصفح الخدمات</h1>
          <p className="text-lg text-muted-foreground">
            اختر الخدمة المناسبة لك من بين مجموعة واسعة من الخدمات المنزلية المتميزة
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b bg-background py-6">
        <div className="container">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="ابحث عن خدمة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                <SelectItem value="cleaning">التنظيف</SelectItem>
                <SelectItem value="hospitality">الضيافة</SelectItem>
                <SelectItem value="gardening">البستنة والزراعة</SelectItem>
                <SelectItem value="other">أخرى</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12">
        <div className="container">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-8 w-8 rounded-lg bg-muted"></div>
                    <div className="h-6 w-32 rounded bg-muted"></div>
                    <div className="h-4 w-full rounded bg-muted"></div>
                    <div className="h-4 w-3/4 rounded bg-muted"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : filteredServices && filteredServices.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service) => (
                <Card key={service.id} className="group cursor-pointer border-2 transition-all hover:border-primary hover:shadow-xl">
                  <Link href={`/services/${service.id}`}>
                    <CardHeader>
                      <div className="mb-4 flex items-center justify-between">
                        <div className="text-5xl">{categoryIcons[service.category] || "🔧"}</div>
                        <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                          {categoryNames[service.category]}
                        </div>
                      </div>
                      <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                        {service.nameAr}
                      </CardTitle>
                      <CardDescription className="text-base line-clamp-3">
                        {service.descriptionAr}
                      </CardDescription>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-lg font-bold text-primary">
                          {service.basePrice} ريال
                        </div>
                        <div className="text-sm text-muted-foreground">
                          لكل {service.priceUnit === "hour" ? "ساعة" : "خدمة"}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        عرض التفاصيل والحجز
                        <ArrowLeft className="mr-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="mb-4 text-6xl">🔍</div>
              <h3 className="mb-2 text-2xl font-bold">لم نجد نتائج</h3>
              <p className="text-muted-foreground">
                جرب تغيير معايير البحث أو الفلترة
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
