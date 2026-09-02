import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "ระบบผู้ดูแล | DORMITORYNAME" },
      {
        name: "description",
        content: "จัดการคำขอจองห้อง เรื่องแจ้งปัญหา สถานะห้องพัก และประกาศถึงผู้เช่าของหอพัก",
      },
      { property: "og:title", content: "ระบบผู้ดูแล | DORMITORYNAME" },
      { property: "og:description", content: "ศูนย์จัดการหอพักสำหรับผู้ดูแลระบบ" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-lg px-4 py-24 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 font-prompt text-2xl font-bold text-foreground">
            เฉพาะผู้ดูแลระบบเท่านั้น
          </h1>
          <p className="mt-2 text-muted-foreground">บัญชีของคุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <h1 className="font-prompt text-3xl font-bold text-foreground">ระบบผู้ดูแล</h1>
        <p className="mt-2 text-muted-foreground">จัดการการจอง เรื่องแจ้งปัญหา ห้องพัก และประกาศ</p>

        <Tabs defaultValue="bookings" className="mt-8">
          <TabsList className="flex-wrap">
            <TabsTrigger value="bookings">การจอง</TabsTrigger>
            <TabsTrigger value="reports">แจ้งปัญหา</TabsTrigger>
            <TabsTrigger value="rooms">ห้องพัก</TabsTrigger>
            <TabsTrigger value="tenants">ผู้เช่า</TabsTrigger>
            <TabsTrigger value="contact">ติดต่อเรา</TabsTrigger>
            <TabsTrigger value="notify">ส่งแจ้งเตือน</TabsTrigger>
            <TabsTrigger value="announcements">ประกาศ</TabsTrigger>
          </TabsList>
          <TabsContent value="bookings" className="mt-6">
            <BookingsTab />
          </TabsContent>
          <TabsContent value="reports" className="mt-6">
            <ReportsTab />
          </TabsContent>
          <TabsContent value="rooms" className="mt-6">
            <RoomsTab />
          </TabsContent>
          <TabsContent value="tenants" className="mt-6">
            <TenantsTab />
          </TabsContent>
          <TabsContent value="contact" className="mt-6">
            <ContactTab />
          </TabsContent>
          <TabsContent value="notify" className="mt-6">
            <NotifyTab />
          </TabsContent>
          <TabsContent value="announcements" className="mt-6">
            <AnnouncementsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function BookingsTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, user_id, status, total_amount, created_at, room_id, rooms(room_code, floor)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const decide = async (
    booking: { id: string; user_id: string; room_id: string; rooms: { room_code: string } | null },
    approve: boolean,
  ) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: approve ? "approved" : "rejected" })
      .eq("id", booking.id);
    if (error) {
      toast.error("อัปเดตไม่สำเร็จ: " + error.message);
      return;
    }
    if (approve) {
      await supabase.from("rooms").update({ status: "occupied" }).eq("id", booking.room_id);
    }
    await supabase.from("notifications").insert({
      user_id: booking.user_id,
      title: approve ? "การจองได้รับการอนุมัติ" : "การจองถูกปฏิเสธ",
      content: `ห้อง ${booking.rooms?.room_code ?? ""} — ${
        approve ? "กรุณาติดต่อสำนักงานเพื่อรับกุญแจ" : "กรุณาติดต่อผู้ดูแลเพื่อสอบถามเพิ่มเติม"
      }`,
    });
    toast.success(approve ? "อนุมัติการจองแล้ว" : "ปฏิเสธการจองแล้ว");
    void qc.invalidateQueries({ queryKey: ["admin-bookings"] });
  };

  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
  if (!data?.length)
    return <p className="rounded-xl bg-muted p-5 text-sm text-muted-foreground">ยังไม่มีคำขอจอง</p>;

  return (
    <div className="space-y-3">
      {data.map((b) => (
        <div
          key={b.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <div>
            <p className="font-semibold text-foreground">
              ห้อง {b.rooms?.room_code ?? "-"} (ชั้น {b.rooms?.floor ?? "-"})
            </p>
            <p className="text-sm text-muted-foreground">
              ยอดรวม ฿{Number(b.total_amount).toLocaleString()} •{" "}
              {new Date(b.created_at).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </div>
          {b.status === "pending" ? (
            <div className="flex gap-2">
              <button
                onClick={() => decide(b, true)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                อนุมัติ
              </button>
              <button
                onClick={() => decide(b, false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                ปฏิเสธ
              </button>
            </div>
          ) : (
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
              {b.status === "approved" ? "อนุมัติแล้ว" : b.status === "rejected" ? "ปฏิเสธ" : "ยกเลิก"}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function ReportImages({ paths }: { paths: string[] }) {
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!paths.length) return;
    void supabase.storage
      .from("report-images")
      .createSignedUrls(paths, 3600)
      .then(({ data }) => setUrls((data ?? []).map((d) => d.signedUrl).filter(Boolean) as string[]));
  }, [paths]);

  if (!paths.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {urls.map((u) => (
        <a key={u} href={u} target="_blank" rel="noreferrer">
          <img src={u} alt="รูปประกอบการแจ้งปัญหา" className="h-24 w-24 rounded-lg object-cover" />
        </a>
      ))}
    </div>
  );
}

function ReportsTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("id, user_id, room_number, category, detail, images, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("reports").update({ status }).eq("id", id);
    if (error) {
      toast.error("อัปเดตไม่สำเร็จ: " + error.message);
      return;
    }
    toast.success("อัปเดตสถานะแล้ว");
    void qc.invalidateQueries({ queryKey: ["admin-reports"] });
  };

  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
  if (!data?.length)
    return <p className="rounded-xl bg-muted p-5 text-sm text-muted-foreground">ยังไม่มีเรื่องแจ้งปัญหา</p>;

  return (
    <div className="space-y-3">
      {data.map((r) => (
        <div key={r.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold text-foreground">
              ห้อง {r.room_number} • {r.category}
            </p>
            <select
              value={r.status}
              onChange={(e) => setStatus(r.id, e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground"
            >
              <option value="pending">รอตรวจสอบ</option>
              <option value="in_progress">กำลังดำเนินการ</option>
              <option value="resolved">แก้ไขแล้ว</option>
              <option value="closed">ปิดเรื่อง</option>
            </select>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{r.detail}</p>
          <ReportImages paths={(r.images ?? []) as string[]} />
        </div>
      ))}
    </div>
  );
}

function RoomsTab() {
  const qc = useQueryClient();
  const [floor, setFloor] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-rooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("id, room_code, floor, status, price")
        .order("floor")
        .order("number");
      if (error) throw error;
      return data;
    },
  });

  const update = async (id: string, patch: { status?: string; price?: number }) => {
    const { error } = await supabase.from("rooms").update(patch).eq("id", id);
    if (error) {
      toast.error("อัปเดตไม่สำเร็จ: " + error.message);
      return;
    }
    toast.success("บันทึกแล้ว");
    void qc.invalidateQueries({ queryKey: ["admin-rooms"] });
  };

  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
  const floors = Array.from(new Set((data ?? []).map((r) => r.floor)));
  const rows = (data ?? []).filter((r) => r.floor === floor);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {floors.map((f) => (
          <button
            key={f}
            onClick={() => setFloor(f)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              f === floor ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            }`}
          >
            ชั้น {f}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div>
              <p className="font-semibold text-foreground">ห้อง {r.room_code}</p>
              <p className="text-sm text-muted-foreground">฿{Number(r.price).toLocaleString()}/เดือน</p>
            </div>
            <select
              value={r.status}
              onChange={(e) => update(r.id, { status: e.target.value })}
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground"
            >
              <option value="available">ว่าง</option>
              <option value="reserved">จองแล้ว</option>
              <option value="occupied">มีผู้เช่า</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnnouncementsTab() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pinned, setPinned] = useState(false);
  const [busy, setBusy] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, content, is_pinned, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("กรุณากรอกหัวข้อและเนื้อหา");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("announcements").insert({
      title: title.trim(),
      content: content.trim(),
      is_pinned: pinned,
      created_by: user?.id ?? null,
    });
    setBusy(false);
    if (error) {
      toast.error("โพสต์ประกาศไม่สำเร็จ: " + error.message);
      return;
    }
    toast.success("โพสต์ประกาศแล้ว");
    setTitle("");
    setContent("");
    setPinned(false);
    void qc.invalidateQueries({ queryKey: ["admin-announcements"] });
    void qc.invalidateQueries({ queryKey: ["announcements"] });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) {
      toast.error("ลบไม่สำเร็จ: " + error.message);
      return;
    }
    toast.success("ลบประกาศแล้ว");
    void qc.invalidateQueries({ queryKey: ["admin-announcements"] });
    void qc.invalidateQueries({ queryKey: ["announcements"] });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="a-title">
            หัวข้อประกาศ
          </label>
          <input
            id="a-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="a-content">
            เนื้อหา
          </label>
          <textarea
            id="a-content"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
          ปักหมุดไว้ด้านบน
        </label>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          โพสต์ประกาศ
        </button>
      </form>

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : (
        <div className="space-y-3">
          {(data ?? []).map((a) => (
            <div key={a.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">
                    {a.is_pinned ? "📌 " : ""}
                    {a.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{a.content}</p>
                </div>
                <button
                  onClick={() => remove(a.id)}
                  className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-muted"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
