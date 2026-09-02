import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Building2, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "เข้าสู่ระบบ | DORMITORYNAME" },
      {
        name: "description",
        content: "เข้าสู่ระบบหรือสมัครสมาชิกหอพัก DORMITORYNAME เพื่อจองห้อง แจ้งปัญหา และติดตามสถานะการจอง",
      },
      { property: "og:title", content: "เข้าสู่ระบบ | DORMITORYNAME" },
      {
        property: "og:description",
        content: "บัญชีผู้เช่าหอพัก DORMITORYNAME สำหรับจองห้องและแจ้งปัญหาออนไลน์",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      void navigate({ to: isAdmin ? "/admin" : "/dashboard", replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) {
        toast.error("เข้าสู่ระบบไม่สำเร็จ: " + error.message);
        return;
      }
      toast.success("เข้าสู่ระบบสำเร็จ");
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: fullName, phone },
        },
      });
      setBusy(false);
      if (error) {
        toast.error("สมัครสมาชิกไม่สำเร็จ: " + error.message);
        return;
      }
      if (!data.session) {
        toast.success("สมัครสมาชิกสำเร็จ", {
          description: "กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชีก่อนเข้าสู่ระบบ",
        });
        setMode("signin");
      } else {
        toast.success("สมัครสมาชิกสำเร็จ");
      }
    }
  };

  const signInWithGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("เข้าสู่ระบบด้วย Google ไม่สำเร็จ");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าหลัก
        </Link>

        <Link to="/" className="mb-6 flex items-center justify-center gap-2 text-primary">
          <Building2 className="h-8 w-8" />
          <span className="font-prompt text-2xl font-bold">DORMITORYNAME</span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-md py-2 text-sm font-semibold transition-colors ${
                  mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {m === "signin" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="name">
                    ชื่อ-นามสกุล
                  </label>
                  <input
                    id="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="phone">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="email">
                อีเมล
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="password">
                รหัสผ่าน
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            หรือ
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            onClick={signInWithGoogle}
            className="w-full rounded-lg border border-input bg-background py-3 font-semibold text-foreground transition-colors hover:bg-muted"
          >
            เข้าสู่ระบบด้วย Google
          </button>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            เป็นเจ้าหน้าที่หอพัก?
            <Link to="/admin-login" className="ml-1 font-semibold text-primary underline-offset-2 hover:underline">
              เข้าสู่ระบบผู้ดูแล
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
