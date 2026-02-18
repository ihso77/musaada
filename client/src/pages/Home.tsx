import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Sparkles, Shield, Clock, Star, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: services, isLoading } = trpc.services.list.useQuery();

  const features = [
    {
      icon: Shield,
      title: "موثوقية عالية",
      description: "جميع مقدمي الخدمات موثقون ومعتمدون",
    },
    {
      icon: Clock,
      title: "خدمة سريعة",
      description: "احجز واحصل على الخدمة في نفس اليوم",
    },
    {
      icon: Star,
      title: "تقييمات حقيقية",
      description: "اطلع على تقييمات العملاء السابقين",
    },
    {
      icon: Sparkles,
      title: "جودة مضمونة",
      description: "نضمن لك أفضل جودة في الخدمة",
    },
  ];

  const categoryIcons: Record<string, string> = {
    cleaning: "🧹",
    hospitality: "☕",
    gardening: "🌱",
    other: "🔧",
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
        
        <div className="container relative py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              <span>منصة الخدمات المنزلية الأولى في المنطقة</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              مساعدة
              <span className="bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent"> لكل منزل</span>
            </h1>
            
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              احصل على أفضل الخدمات المنزلية من مقدمي خدمات محترفين وموثوقين.
              تنظيف، ضيافة، بستنة وأكثر - كل ما تحتاجه في مكان واحد.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              {isAuthenticated ? (
                <Button size="lg" asChild className="text-lg">
                  <Link href="/services">
                    تصفح الخدمات
                    <ArrowLeft className="mr-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" asChild className="text-lg">
                  <a href={getLoginUrl()}>
                    ابدأ الآن
                    <ArrowLeft className="mr-2 h-5 w-5" />
                  </a>
                </Button>
              )}
              <Button size="lg" variant="outline" asChild className="text-lg">
                <Link href="/become-provider">
                  انضم كمقدم خدمة
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">لماذا مساعدة؟</h2>
            <p className="text-lg text-muted-foreground">
              نوفر لك تجربة استثنائية في الحصول على الخدمات المنزلية
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 transition-all hover:border-primary hover:shadow-lg">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">خدماتنا المتميزة</h2>
            <p className="text-lg text-muted-foreground">
              اختر من بين مجموعة واسعة من الخدمات المنزلية
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-8 w-8 rounded-lg bg-muted"></div>
                    <div className="h-6 w-32 rounded bg-muted"></div>
                    <div className="h-4 w-full rounded bg-muted"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services?.map((service) => (
                <Card key={service.id} className="group cursor-pointer border-2 transition-all hover:border-primary hover:shadow-xl">
                  <Link href={`/services/${service.id}`}>
                    <CardHeader>
                      <div className="mb-4 flex items-center justify-between">
                        <div className="text-4xl">{categoryIcons[service.category] || "🔧"}</div>
                        <div className="text-sm font-medium text-primary">
                          {service.basePrice} ريال/{service.priceUnit === "hour" ? "ساعة" : "خدمة"}
                        </div>
                      </div>
                      <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                        {service.nameAr}
                      </CardTitle>
                      <CardDescription className="text-base line-clamp-2">
                        {service.descriptionAr}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        عرض التفاصيل
                        <ArrowLeft className="mr-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
          
          {services && services.length > 0 && (
            <div className="mt-12 text-center">
              <Button size="lg" variant="outline" asChild>
                <Link href="/services">
                  عرض جميع الخدمات
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-accent text-primary-foreground">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">
              جاهز للبدء؟
            </h2>
            <p className="mb-8 text-lg opacity-90">
              انضم إلى آلاف العملاء الراضين واحصل على أفضل الخدمات المنزلية اليوم
            </p>
            {isAuthenticated ? (
              <Button size="lg" variant="secondary" asChild className="text-lg">
                <Link href="/services">
                  تصفح الخدمات الآن
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" variant="secondary" asChild className="text-lg">
                <a href={getLoginUrl()}>
                  سجل الآن مجاناً
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
