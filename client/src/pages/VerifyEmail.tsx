import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [verificationCode, setVerificationCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // استخراج userId و token من URL
  const params = new URLSearchParams(search);
  const userId = params.get("userId");
  const token = params.get("token");

  const verifyEmail = trpc.auth.verifyEmail.useMutation({
    onSuccess: () => {
      setStatus("success");
      setMessage("تم التحقق من البريد الإلكتروني بنجاح!");
      toast.success("تم التحقق من البريد الإلكتروني!");
      setTimeout(() => setLocation("/login"), 3000);
    },
    onError: (error) => {
      setStatus("error");
      setMessage(error.message);
      toast.error(error.message);
    },
  });

  // التحقق التلقائي إذا كان هناك token في URL
  useEffect(() => {
    if (token && userId) {
      setVerificationCode(token);
      setStatus("loading");
      verifyEmail.mutate({
        userId: parseInt(userId),
        token,
      });
    }
  }, [token, userId]);

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode || !userId) {
      toast.error("يرجى إدخال رمز التحقق");
      return;
    }

    setStatus("loading");
    verifyEmail.mutate({
      userId: parseInt(userId),
      token: verificationCode,
    });
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-12 pb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">تم التحقق بنجاح!</h2>
            <p className="text-muted-foreground mb-6">
              تم التحقق من بريدك الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول.
            </p>
            <Button asChild className="w-full">
              <Link href="/login">تسجيل الدخول</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-12 pb-8">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">فشل التحقق</h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStatus("idle");
                  setVerificationCode("");
                }}
              >
                حاول مرة أخرى
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/register">إنشاء حساب جديد</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">التحقق من البريد الإلكتروني</CardTitle>
          <CardDescription>
            أدخل رمز التحقق الذي تم إرساله إلى بريدك الإلكتروني
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleManualVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">رمز التحقق</Label>
              <Input
                id="code"
                type="text"
                placeholder="أدخل رمز التحقق من 6 أحرف"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                maxLength={6}
                required
                disabled={status === "loading"}
              />
              <p className="text-xs text-muted-foreground">
                الرمز يتكون من 6 أحرف وأرقام
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={status === "loading" || !verificationCode}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري التحقق...
                </>
              ) : (
                "تحقق الآن"
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              لم تستقبل الرمز؟{" "}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => toast.info("سيتم إرسال رمز جديد قريباً")}
              >
                أعد الإرسال
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
