import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Star, ArrowRight } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";

export default function ReviewBooking() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [, setLocation] = useLocation();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const createReview = trpc.reviews.create.useMutation({
    onSuccess: () => {
      toast.success("شكراً على تقييمك!");
      setTimeout(() => setLocation("/dashboard"), 1500);
    },
    onError: (error) => {
      toast.error("فشل إضافة التقييم");
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("يرجى اختيار تقييم");
      return;
    }

    createReview.mutate({
      bookingId: parseInt(bookingId || "0"),
      providerId: 1, // TODO: Get from booking data
      serviceId: 1, // TODO: Get from booking data
      rating,
      comment: comment || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-2xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/dashboard">
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">قيّم الخدمة</CardTitle>
            <CardDescription>
              شارك رأيك حول الخدمة التي تلقيتها لمساعدة الآخرين
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div className="space-y-3">
                <Label className="text-base">التقييم</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-12 w-12 ${
                          star <= (hoveredRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {rating > 0 && `تقييمك: ${rating} من 5 نجوم`}
                </p>
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <Label htmlFor="comment">تعليقك (اختياري)</Label>
                <Textarea
                  id="comment"
                  placeholder="شارك تفاصيل عن تجربتك مع الخدمة..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={5}
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={createReview.isPending}
              >
                {createReview.isPending ? "جاري الإرسال..." : "إرسال التقييم"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
