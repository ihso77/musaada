import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Users, ShoppingCart, TrendingUp, Settings } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // التحقق من أن المستخدم هو إدمن
  useEffect(() => {
    if (user && user.role !== "admin") {
      setLocation("/");
    }
  }, [user, setLocation]);

  const { data: users } = trpc.admin.getUsers.useQuery();
  const { data: bookings } = trpc.admin.getBookings.useQuery();
  const { data: stats } = trpc.admin.getStatistics.useQuery();

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="mb-4 text-6xl">🔒</div>
            <h2 className="mb-2 text-xl font-bold">الوصول مرفوض</h2>
            <p className="text-muted-foreground">
              أنت لا تملك صلاحيات الوصول إلى هذه الصفحة
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b bg-muted/30 py-8">
        <div className="container">
          <h1 className="mb-2 text-4xl font-bold">لوحة تحكم الإدمن</h1>
          <p className="text-lg text-muted-foreground">
            إدارة المنصة والمستخدمين والحجوزات
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 border-b">
        <div className="container">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">+12% من الشهر الماضي</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الحجوزات النشطة</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">+5 اليوم</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الإيرادات</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45,231 ريال</div>
                <p className="text-xs text-muted-foreground">+8% من الشهر الماضي</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">مقدمو الخدمات</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89</div>
                <p className="text-xs text-muted-foreground">+3 موثقين</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-12">
        <div className="container">
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="users">المستخدمين</TabsTrigger>
              <TabsTrigger value="bookings">الحجوزات</TabsTrigger>
              <TabsTrigger value="settings">الإعدادات</TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>إدارة المستخدمين</CardTitle>
                  <CardDescription>
                    عرض وإدارة جميع مستخدمي المنصة
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between border-b pb-4">
                        <div>
                          <p className="font-medium">مستخدم #{i}</p>
                          <p className="text-sm text-muted-foreground">user{i}@example.com</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge>نشط</Badge>
                          <Button variant="outline" size="sm">
                            عرض
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>إدارة الحجوزات</CardTitle>
                  <CardDescription>
                    عرض وإدارة جميع حجوزات المنصة
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between border-b pb-4">
                        <div>
                          <p className="font-medium">حجز #{i}</p>
                          <p className="text-sm text-muted-foreground">2026-02-18</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className="bg-blue-500">مؤكد</Badge>
                          <Button variant="outline" size="sm">
                            عرض
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات المنصة</CardTitle>
                  <CardDescription>
                    إدارة إعدادات النظام والخدمات
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">الصيانة</p>
                      <p className="text-sm text-muted-foreground">
                        تفعيل وضع الصيانة
                      </p>
                    </div>
                    <Button variant="outline">تفعيل</Button>
                  </div>
                  <div className="border-t pt-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">النسخ الاحتياطي</p>
                      <p className="text-sm text-muted-foreground">
                        إنشاء نسخة احتياطية من البيانات
                      </p>
                    </div>
                    <Button variant="outline">إنشاء</Button>
                  </div>
                  <div className="border-t pt-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">التقارير</p>
                      <p className="text-sm text-muted-foreground">
                        تحميل التقارير الشاملة
                      </p>
                    </div>
                    <Button variant="outline">تحميل</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
