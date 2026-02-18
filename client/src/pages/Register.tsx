import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Mail, Lock, User, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Register() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<"register" | "verify">("register");
  const [userId, setUserId] = useState<number | null>(null);
  const [verificationCode, setVerificationCode] = useState("");

  const register = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setUserId(data.userId);
      setStep("verify");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const verifyEmail = trpc.auth.verifyEmail.useMutation({
    onSuccess: () => {
      toast.success("تم التحقق من البريد الإلكتروني بنجاح!");
      setTimeout(() => setLocation("/login"), 2000);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword || !name) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("كلمات المرور غير متطابقة");
      return;
    }

    if (password.length < 8) {
      toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }

    register.mutate({ email, password, name });
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode || !userId) {
      toast.error("يرجى إدخال رمز التحقق");
      return;
    }

    verifyEmail.mutate({ userId, token: verificationCode });
  };

  if (step === "verify") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">التحقق من البريد الإلكتروني</CardTitle>
            <CardDescription>
              تم إرسال رمز التحقق إلى {email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">رمز التحقق</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="أدخل رمز التحقق من 6 أرقام"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={verifyEmail.isPending}
              >
                {verifyEmail.isPending ? "جاري التحقق..." : "تحقق الآن"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep("register")}
              >
                <ArrowLeft className="ml-2 h-4 w-4" />
                العودة
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">إنشاء حساب جديد</CardTitle>
          <CardDescription>
            انضم إلى منصة Musaada واحصل على أفضل الخدمات المنزلية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                الاسم الكامل
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="أدخل اسمك الكامل"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                كلمة المرور
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="أدخل كلمة مرور قوية (8 أحرف على الأقل)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                تأكيد كلمة المرور
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="أعد إدخال كلمة المرور"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={register.isPending}
            >
              {register.isPending ? "جاري الإنشاء..." : "إنشاء الحساب"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              هل لديك حساب بالفعل؟{" "}
              <Link href="/login" className="text-primary hover:underline">
                سجل دخول
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
