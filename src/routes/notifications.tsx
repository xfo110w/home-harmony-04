import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Pin, Megaphone, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "ประกาศและแจ้งเตือน | DORMITORYNAME" },
      {
        name: "description",
        content: "ประกาศจากผู้ดูแลหอพัก ข่าวสารการปิดปรับปรุง กำหนดชำระค่าเช่า และแจ้งเตือนสำคัญ",
      },
      { property: "og:title", content: "ประกาศและแจ้งเตือน | DORMITORYNAME" },
      {
        property: "og:description",
        content: "ติดตามประกาศล่าสุดจากผู้ดูแลหอพัก DORMITORYNAME ได้ที่นี่",
      },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, content, is_pinned, created_at")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-prompt text-3xl font-bold text-foreground">ประกาศและแจ้งเตือน</h1>
        <p className="mt-2 text-muted-foreground">ข่าวสารและประกาศล่าสุดจากผู้ดูแลหอพัก</p>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !data?.length ? (
          <p className="mt-10 rounded-xl bg-muted p-6 text-center text-muted-foreground">
            ยังไม่มีประกาศในขณะนี้
          </p>
        ) : (
          <div className="mt-8 space-y-4">
            {data.map((a) => (
              <article
                key={a.id}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    {a.is_pinned ? (
                      <Pin className="h-5 w-5 text-accent" />
                    ) : (
                      <Megaphone className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-prompt text-lg font-semibold text-foreground">{a.title}</h2>
                    <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                      {a.content}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {new Date(a.created_at).toLocaleString("th-TH", { dateStyle: "long", timeStyle: "short" })}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
