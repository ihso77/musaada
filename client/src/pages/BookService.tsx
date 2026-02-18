import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { CalendarIcon, Clock, MapPin, User, ArrowRight } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function BookService() {
  const { providerId } = useParams<{ providerId: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const [bookingDate, setBookingDate] = useState<Date>();
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(2);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");

  const providerIdNum = parseInt(providerId || "0");
  
  // Get provider details (we'll need to fetch this)
  const { data: provider } = trpc.providers.getByUserId.useQuery();
  
  const createBooking = trpc.bookings.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الحجز بنجاح!");
      setLocation("/dashboard/bookings");
    },
    onError: (error) => {
      toast.error("حدث خطأ أثناء إنشاء الحجز");
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingDate || !startTime || !address || !city) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    // Calculate total price (this is a simple calculation, adjust as needed)
    const hourlyRate = 50; // This should come from provider data
    const totalPrice = (hourlyRate * duration).toString();

    createBooking.mutate({
      providerId: providerIdNum,
      serviceId: 1, // This should be passed from the service details page
      bookingDate,
      startTime,
      duration,
      address,
      city,
      notes,
      totalPrice,
    });
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/services">
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">حجز الخدمة</CardTitle>
            <CardDescription>
              املأ التفاصيل التالية لإتمام حجز الخدمة
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Selection */}
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  تاريخ الخدمة *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-right font-normal"
                    >
                      {bookingDate ? (
                        format(bookingDate, "PPP", { locale: ar })
                      ) : (
                        <span>اختر التاريخ</span>
                      )}
                      <CalendarIcon className="mr-auto h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={bookingDate}
                      onSelect={setBookingDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  وقت البدء *
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  المدة (بالساعات) *
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="12"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  required
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  العنوان *
                </Label>
                <Textarea
                  id="address"
                  placeholder="أدخل العنوان الكامل"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  rows={3}
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  المدينة *
                </Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="أدخل المدينة"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
                <Textarea
                  id="notes"
                  placeholder="أي تفاصيل إضافية تريد إضافتها"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Price Summary */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">ملخص السعر</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>السعر بالساعة:</span>
                    <span className="font-medium">50 ريال</span>
                  </div>
                  <div className="flex justify-between">
                    <span>عدد الساعات:</span>
                    <span className="font-medium">{duration}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-lg font-bold">
                    <span>الإجمالي:</span>
                    <span className="text-primary">{50 * duration} ريال</span>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={createBooking.isPending}
              >
                {createBooking.isPending ? "جاري الحجز..." : "تأكيد الحجز"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
