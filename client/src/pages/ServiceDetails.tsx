import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Star, MapPin, Clock, Shield, ArrowRight, Calendar } from "lucide-react";
import { Link, useParams } from "wouter";

export default function ServiceDetails() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const serviceId = parseInt(id || "0");
  
  const { data: service, isLoading: serviceLoading } = trpc.services.getById.useQuery({ id: serviceId });
  const { data: providers, isLoading: providersLoading } = trpc.providers.listByService.useQuery({ serviceId });

  const categoryIcons: Record<string, string> = {
    cleaning: "🧹",
    hospitality: "☕",
    gardening: "🌱",
    other: "🔧",
  };

  if (serviceLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-12 w-3/4 rounded bg-muted"></div>
            <div className="h-6 w-1/2 rounded bg-muted"></div>
            <div className="h-32 w-full rounded bg-muted"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-20 text-center">
          <div className="mb-4 text-6xl">😕</div>
          <h2 className="mb-4 text-3xl font-bold">الخدمة غير موجودة</h2>
          <Button asChild>
            <Link href="/services">
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة للخدمات
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Service Header */}
      <section className="border-b bg-gradient-to-br from-primary/10 via-background to-accent/5 py-12">
        <div className="container">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/services">
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة للخدمات
            </Link>
          </Button>
          
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            <div className="flex-1">
              <div className="mb-4 text-6xl">{categoryIcons[service.category] || "🔧"}</div>
              <h1 className="mb-4 text-4xl font-bold">{service.nameAr}</h1>
              <p className="mb-6 text-lg text-muted-foreground">{service.descriptionAr}</p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-medium">متاح على مدار الساعة</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-medium">مقدمو خدمات موثقون</span>
                </div>
              </div>
            </div>
            
            <Card className="w-full md:w-80">
              <CardHeader>
                <CardTitle>السعر الأساسي</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 text-3xl font-bold text-primary">
                  {service.basePrice} ريال
                </div>
                <p className="text-sm text-muted-foreground">
                  لكل {service.priceUnit === "hour" ? "ساعة" : "خدمة"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Providers Section */}
      <section className="py-12">
        <div className="container">
          <div className="mb-8">
            <h2 className="mb-2 text-3xl font-bold">مقدمو الخدمة المتاحون</h2>
            <p className="text-muted-foreground">
              اختر مقدم الخدمة المناسب لك بناءً على التقييمات والخبرة
            </p>
          </div>

          {providersLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-16 w-16 rounded-full bg-muted"></div>
                    <div className="h-6 w-32 rounded bg-muted"></div>
                    <div className="h-4 w-full rounded bg-muted"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : providers && providers.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {providers.map(({ provider, user }) => (
                <Card key={provider.id} className="border-2 transition-all hover:border-primary hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-4 flex items-start justify-between">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={user?.avatar || undefined} />
                        <AvatarFallback className="text-lg">
                          {user?.name?.charAt(0) || "م"}
                        </AvatarFallback>
                      </Avatar>
                      {provider.isVerified && (
                        <Badge variant="default" className="gap-1">
                          <Shield className="h-3 w-3" />
                          موثق
                        </Badge>
                      )}
                    </div>
                    
                    <CardTitle className="text-xl">{user?.name || "مقدم خدمة"}</CardTitle>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{provider.rating}</span>
                      </div>
                      <span className="text-muted-foreground">
                        ({provider.totalReviews} تقييم)
                      </span>
                    </div>
                    
                    <CardDescription className="mt-2">
                      {user?.bio || "مقدم خدمة محترف ومتميز"}
                    </CardDescription>
                    
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{provider.experience} سنوات خبرة</span>
                      </div>
                      {user?.city && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{user.city}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{provider.completedBookings} حجز مكتمل</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 rounded-lg bg-primary/10 p-3">
                      <div className="text-sm text-muted-foreground">السعر</div>
                      <div className="text-xl font-bold text-primary">
                        {provider.hourlyRate} ريال/ساعة
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {isAuthenticated ? (
                      <Button className="w-full" asChild>
                        <Link href={`/book/${provider.id}`}>
                          احجز الآن
                        </Link>
                      </Button>
                    ) : (
                      <Button className="w-full" asChild>
                        <a href={getLoginUrl()}>
                          سجل دخول للحجز
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="py-12 text-center">
              <CardContent>
                <div className="mb-4 text-6xl">😔</div>
                <h3 className="mb-2 text-xl font-bold">لا يوجد مقدمو خدمة متاحون حالياً</h3>
                <p className="text-muted-foreground">
                  يرجى المحاولة مرة أخرى لاحقاً أو تصفح خدمات أخرى
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
