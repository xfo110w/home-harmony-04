import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "แจ้งปัญหาห้องพัก | DORMITORYNAME" },
      {
        name: "description",
        content: "แจ้งปัญหาห้องพัก น้ำ ไฟ แอร์ หรืออุปกรณ์ชำรุด พร้อมแนบรูปถ่ายถึงผู้ดูแลหอพักโดยตรง",
      },
      { property: "og:title", content: "แจ้งปัญหาห้องพัก | DORMITORYNAME" },
      {
        property: "og:description",
        content: "ส่งเรื่องแจ้งซ่อมพร้อมรูปภาพ และติดตามสถานะการแก้ไขได้จากบัญชีของคุณ",
      },
    ],
  }),
  component: ReportPage,
});

const categories = [
  "ไฟฟ้า",
  "ประปา / น้ำรั่ว",
  "เครื่องปรับอากาศ",
  "เฟอร์นิเจอร์ชำรุด",
  "อินเทอร์เน็ต",
  "ความสะอาดส่วนกลาง",
  "อื่น ๆ",
];

function ReportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [roomNumber, setRoomNumber] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [detail, setDetail] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบก่อนแจ้งปัญหา");
      void navigate({ to: "/auth" });
      return;
    }
    if (!roomNumber.trim() || !detail.trim()) {
      toast.error("กรุณากรอกเลขห้องและรายละเอียด");
      return;
    }

    setBusy(true);
    const paths: string[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("report-images").upload(path, file);
      if (error) {
        setBusy(false);
        toast.error("อัปโหลดรูปไม่สำเร็จ: " + error.message);
        return;
      }
      paths.push(path);
    }

    const { error } = await supabase.from("reports").insert({
      user_id: user.id,
      room_number: roomNumber.trim(),
      category,
      detail: detail.trim(),
      images: paths,
      status: "pending",
    });
    setBusy(false);
    if (error) {
      toast.error("ส่งเรื่องไม่สำเร็จ: " + error.message);
      return;
    }
    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "รับเรื่องแจ้งปัญหาแล้ว",
      content: `ห้อง ${roomNumber.trim()} • ${category} — ผู้ดูแลจะตรวจสอบโดยเร็ว`,
    });
    toast.success("ส่งเรื่องแจ้งปัญหาเรียบร้อย");
    setRoomNumber("");
    setDetail("");
    setFiles([]);
    void navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <h1 className="font-prompt text-3xl font-bold text-foreground">แจ้งปัญหาห้องพัก</h1>
        <p className="mt-2 text-muted-foreground">
          กรอกรายละเอียดปัญหาและแนบรูปภาพ เพื่อให้ทีมช่างเข้าตรวจสอบได้รวดเร็วขึ้น
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="room">
              เลขห้อง
            </label>
            <input
              id="room"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="เช่น 203"
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="category">
              ประเภทปัญหา
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="detail">
              รายละเอียด
            </label>
            <textarea
              id="detail"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={5}
              placeholder="อธิบายปัญหาที่พบ..."
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-foreground">แนบรูปภาพ</span>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-muted/50 py-6 text-sm text-muted-foreground transition-colors hover:bg-muted">
              <Upload className="h-4 w-4" />
              เลือกรูปภาพ (เลือกได้หลายรูป)
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              />
            </label>
            {files.length > 0 && (
              <ul className="mt-3 space-y-2">
                {files.map((f, i) => (
                  <li
                    key={f.name + i}
                    className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm text-foreground"
                  >
                    <span className="truncate">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      aria-label="ลบรูป"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            ส่งเรื่องแจ้งปัญหา
          </button>
        </form>
      </div>
    </div>
  );
}
