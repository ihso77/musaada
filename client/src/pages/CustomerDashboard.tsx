import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";
import { Calendar, Clock, MapPin, Star, User, Bell } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { data: bookings, isLoading } = trpc.bookings.listByCustomer.useQuery();
  const { data: notifications } = trpc.notifications.list.useQuery();

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500",
    confirmed: "bg-blue-500",
    in_progress: "bg-purple-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
  };

  const statusLabels: Record<string, string> = {
    pending: "قيد الانتظار",
    confirmed: "مؤكد",
    in_progress: "جاري التنفيذ",
    completed: "مكتمل",
    cancelled: "ملغي",
  };

  const activeBookings = bookings?.filter(
    (b) => b.booking.status === "pending" || b.booking.status === "confirmed" || b.booking.status === "in_progress"
  );
  
  const pastBookings = bookings?.filter(
    (b) => b.booking.status === "completed" || b.booking.status === "cancelled"
  );

  const unreadNotifications = notifications?.filter((n) => !n.isRead).length || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b bg-gradient-to-br from-primary/10 via-background to-accent/5 py-12">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold">لوحة التحكم</h1>
              <p className="text-lg text-muted-foreground">
                مرحباً، {user?.name || "عزيزي العميل"}
              </p>
            </div>
            <Button variant="outline" size="icon" className="relative" asChild>
              <Link href="/notifications">
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {unreadNotifications}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 border-b">
        <div className="container">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الحجوزات النشطة</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeBookings?.length || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الحجوزات المكتملة</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {bookings?.filter((b) => b.booking.status === "completed").length || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الإشعارات الجديدة</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unreadNotifications}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Bookings */}
      <section className="py-12">
        <div className="container">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="active">الحجوزات النشطة</TabsTrigger>
              <TabsTrigger value="past">السجل</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="mt-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-6 w-32 rounded bg-muted"></div>
                        <div className="h-4 w-full rounded bg-muted"></div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : activeBookings && activeBookings.length > 0 ? (
                <div className="space-y-4">
                  {activeBookings.map(({ booking, providerUser, service }) => (
                    <Card key={booking.id} className="border-2 hover:border-primary transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={providerUser?.avatar || undefined} />
                              <AvatarFallback>
                                {providerUser?.name?.charAt(0) || "م"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-xl">{service?.nameAr}</CardTitle>
                              <CardDescription>
                                مقدم الخدمة: {providerUser?.name || "غير محدد"}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={statusColors[booking.status]}>
                            {statusLabels[booking.status]}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(booking.bookingDate), "PPP", { locale: ar })}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{booking.startTime} - {booking.duration} ساعات</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{booking.address}, {booking.city}</span>
                        </div>
                        
                        <div className="flex items-center justify-between border-t pt-3">
                          <span className="text-lg font-bold text-primary">
                            {booking.totalPrice} ريال
                          </span>
                          <Button variant="outline" size="sm">
                            عرض التفاصيل
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="py-12 text-center">
                  <CardContent>
                    <div className="mb-4 text-6xl">📅</div>
                    <h3 className="mb-2 text-xl font-bold">لا توجد حجوزات نشطة</h3>
                    <p className="mb-4 text-muted-foreground">
                      ابدأ بحجز خدمة جديدة الآن
                    </p>
                    <Button asChild>
                      <Link href="/services">تصفح الخدمات</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="past" className="mt-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-6 w-32 rounded bg-muted"></div>
                        <div className="h-4 w-full rounded bg-muted"></div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : pastBookings && pastBookings.length > 0 ? (
                <div className="space-y-4">
                  {pastBookings.map(({ booking, providerUser, service }) => (
                    <Card key={booking.id} className="opacity-75">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={providerUser?.avatar || undefined} />
                              <AvatarFallback>
                                {providerUser?.name?.charAt(0) || "م"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-xl">{service?.nameAr}</CardTitle>
                              <CardDescription>
                                مقدم الخدمة: {providerUser?.name || "غير محدد"}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={statusColors[booking.status]}>
                            {statusLabels[booking.status]}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(booking.bookingDate), "PPP", { locale: ar })}</span>
                        </div>
                        
                        <div className="flex items-center justify-between border-t pt-3">
                          <span className="text-lg font-bold">
                            {booking.totalPrice} ريال
                          </span>
                          {booking.status === "completed" && (
                            <Button variant="outline" size="sm">
                              أضف تقييم
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="py-12 text-center">
                  <CardContent>
                    <div className="mb-4 text-6xl">📋</div>
                    <h3 className="mb-2 text-xl font-bold">لا توجد حجوزات سابقة</h3>
                    <p className="text-muted-foreground">
                      سيظهر سجل حجوزاتك هنا
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
