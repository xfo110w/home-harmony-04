import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { MapPin, Phone, Mail, Clock, MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "ติดต่อเรา | DORMITORYNAME" },
      {
        name: "description",
        content: "ที่อยู่ เบอร์โทร อีเมล และเวลาทำการของสำนักงานหอพัก DORMITORYNAME ติดต่อสอบถามห้องว่างได้ทุกวัน",
      },
      { property: "og:title", content: "ติดต่อเรา | DORMITORYNAME" },
      {
        property: "og:description",
        content: "สอบถามห้องว่าง นัดชมห้อง หรือแจ้งเรื่องด่วนกับผู้ดูแลหอพัก DORMITORYNAME",
      },
    ],
  }),
  component: ContactPage,
});

const items = [
  { icon: MapPin, title: "ที่อยู่", lines: ["123 ถนนตัวอย่าง ตำบลในเมือง", "อำเภอเมือง จังหวัดตัวอย่าง 10000"] },
  { icon: Phone, title: "โทรศัพท์", lines: ["08X-XXX-XXXX", "0X-XXX-XXXX (สำนักงาน)"] },
  { icon: Mail, title: "อีเมล", lines: ["contact@dormitoryname.com"] },
  { icon: Clock, title: "เวลาทำการ", lines: ["จันทร์ - อาทิตย์", "08:00 - 20:00 น."] },
];

function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="font-prompt text-3xl font-bold text-foreground">ติดต่อเรา</h1>
        <p className="mt-2 text-muted-foreground">
          สอบถามห้องว่าง นัดชมห้อง หรือแจ้งเรื่องด่วน ทีมงานยินดีให้บริการ
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="mt-4 font-prompt text-lg font-semibold text-foreground">{item.title}</h2>
              {item.lines.map((l) => (
                <p key={l} className="mt-1 text-sm text-muted-foreground">
                  {l}
                </p>
              ))}
            </div>
          ))}
        </div>

        <ContactForm />

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-secondary p-6">
          <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm text-foreground">
            ผู้เช่าปัจจุบันสามารถแจ้งปัญหาห้องพักผ่านเมนู “แจ้งปัญหา” เพื่อให้ทีมช่างติดตามงานได้เร็วกว่าการโทร
          </p>
        </div>
      </div>
    </div>
  );
}

function ContactForm() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      subject: subject.trim(),
      message: message.trim(),
    });
    setBusy(false);
    if (error) {
      toast.error("ส่งข้อความไม่สำเร็จ: " + error.message);
      return;
    }
    toast.success("ส่งข้อความถึงผู้ดูแลแล้ว", { description: "ทีมงานจะติดต่อกลับโดยเร็วที่สุด" });
    setName("");
    setPhone("");
    setSubject("");
    setMessage("");
  };

  return (
    <form
      onSubmit={submit}
      className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <h2 className="font-prompt text-xl font-semibold text-foreground">ส่งข้อความถึงผู้ดูแล</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="c-name">
            ชื่อ-นามสกุล
          </label>
          <input
            id="c-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="c-email">
            อีเมล
          </label>
          <input
            id="c-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="c-phone">
            เบอร์โทรศัพท์ (ไม่บังคับ)
          </label>
          <input
            id="c-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="c-subject">
            หัวข้อ
          </label>
          <input
            id="c-subject"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="c-message">
          ข้อความ
        </label>
        <textarea
          id="c-message"
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        ส่งข้อความ
      </button>
    </form>
  );
}
