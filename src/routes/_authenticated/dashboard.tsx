import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, BedDouble, Wrench, Bell } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "บัญชีของฉัน | DORMITORYNAME" },
      {
        name: "description",
        content: "ดูประวัติการจองห้อง สถานะเรื่องแจ้งปัญหา และการแจ้งเตือนส่วนตัวของคุณ",
      },
      { property: "og:title", content: "บัญชีของฉัน | DORMITORYNAME" },
      { property: "og:description", content: "ศูนย์รวมการจองและการแจ้งปัญหาของผู้เช่าหอพัก" },
    ],
  }),
  component: DashboardPage,
});

const bookingStatus: Record<string, { label: string; className: string }> = {
  pending: { label: "รออนุมัติ", className: "bg-room-reserved text-foreground" },
  approved: { label: "อนุมัติแล้ว", className: "bg-room-available text-primary-foreground" },
  rejected: { label: "ปฏิเสธ", className: "bg-room-occupied text-primary-foreground" },
  cancelled: { label: "ยกเลิก", className: "bg-muted text-muted-foreground" },
};

const reportStatus: Record<string, string> = {
  pending: "รอตรวจสอบ",
  in_progress: "กำลังดำเนินการ",
  resolved: "แก้ไขแล้ว",
  closed: "ปิดเรื่อง",
};

function DashboardPage() {
  const { user } = useAuth();

  const bookings = useQuery({
    queryKey: ["my-bookings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, status, total_amount, created_at, rooms(room_code, floor)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const reports = useQuery({
    queryKey: ["my-reports", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("id, room_number, category, detail, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const notifications = useQuery({
    queryKey: ["my-notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, content, is_read, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="font-prompt text-3xl font-bold text-foreground">บัญชีของฉัน</h1>
        <p className="mt-2 text-muted-foreground">{user?.email}</p>

        <section className="mt-8">
          <h2 className="flex items-center gap-2 font-prompt text-xl font-semibold text-foreground">
            <BedDouble className="h-5 w-5 text-primary" /> ประวัติการจอง
          </h2>
          <div className="mt-4 space-y-3">
            {bookings.isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : !bookings.data?.length ? (
              <p className="rounded-xl bg-muted p-5 text-sm text-muted-foreground">ยังไม่มีการจอง</p>
            ) : (
              bookings.data.map((b) => {
                const st = bookingStatus[b.status] ?? bookingStatus["pending"]!;
                return (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm"
                  >
                    <div>
                      <p className="font-semibold text-foreground">
                        ห้อง {b.rooms?.room_code ?? "-"} (ชั้น {b.rooms?.floor ?? "-"})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ยอดรวม ฿{Number(b.total_amount).toLocaleString()} •{" "}
                        {new Date(b.created_at).toLocaleDateString("th-TH", { dateStyle: "medium" })}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${st.className}`}>
                      {st.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="flex items-center gap-2 font-prompt text-xl font-semibold text-foreground">
            <Wrench className="h-5 w-5 text-primary" /> เรื่องแจ้งปัญหา
          </h2>
          <div className="mt-4 space-y-3">
            {reports.isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : !reports.data?.length ? (
              <p className="rounded-xl bg-muted p-5 text-sm text-muted-foreground">
                ยังไม่มีเรื่องแจ้งปัญหา
              </p>
            ) : (
              reports.data.map((r) => (
                <div key={r.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">
                      ห้อง {r.room_number} • {r.category}
                    </p>
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                      {reportStatus[r.status] ?? r.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{r.detail}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="flex items-center gap-2 font-prompt text-xl font-semibold text-foreground">
            <Bell className="h-5 w-5 text-primary" /> การแจ้งเตือนของฉัน
          </h2>
          <div className="mt-4 space-y-3">
            {notifications.isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : !notifications.data?.length ? (
              <p className="rounded-xl bg-muted p-5 text-sm text-muted-foreground">
                ยังไม่มีการแจ้งเตือน
              </p>
            ) : (
              notifications.data.map((n) => (
                <div key={n.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <p className="font-semibold text-foreground">{n.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{n.content}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(n.created_at).toLocaleString("th-TH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
