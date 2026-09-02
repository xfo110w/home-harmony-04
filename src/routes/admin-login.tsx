import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "เข้าสู่ระบบผู้ดูแล | DORMITORYNAME" },
      {
        name: "description",
        content: "ช่องทางเข้าสู่ระบบสำหรับผู้ดูแลหอพัก DORMITORYNAME เพื่อจัดการการจอง ห้องพัก และเรื่องแจ้งปัญหา",
      },
      { property: "og:title", content: "เข้าสู่ระบบผู้ดูแล | DORMITORYNAME" },
      { property: "og:description", content: "เข้าสู่ระบบผู้ดูแลหอพัก DORMITORYNAME" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && isAdmin) {
      void navigate({ to: "/admin", replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error("เข้าสู่ระบบไม่สำเร็จ: " + error.message);
      return;
    }
    toast.success("เข้าสู่ระบบสำเร็จ");
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
          <ShieldCheck className="h-8 w-8" />
          <span className="font-prompt text-2xl font-bold">ผู้ดูแลหอพัก</span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="font-prompt text-xl font-bold text-foreground">เข้าสู่ระบบผู้ดูแล</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            สำหรับเจ้าหน้าที่หอพักเท่านั้น ผู้เช่ากรุณาใช้หน้า
            <Link to="/auth" className="ml-1 font-semibold text-primary underline-offset-2 hover:underline">
              เข้าสู่ระบบผู้เช่า
            </Link>
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="admin-email">
                อีเมลผู้ดูแล
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="admin-password">
                รหัสผ่าน
              </label>
              <input
                id="admin-password"
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
              เข้าสู่ระบบ
            </button>
          </form>

          {!loading && user && !isAdmin && (
            <p className="mt-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              บัญชีนี้ไม่มีสิทธิ์ผู้ดูแล กรุณาติดต่อสำนักงานหอพัก
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
