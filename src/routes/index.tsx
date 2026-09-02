import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, ShieldCheck, Wifi, Car, MapPin, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DORMITORYNAME | หอพักสะอาด ปลอดภัย ใกล้มหาวิทยาลัย" },
      {
        name: "description",
        content:
          "หอพัก DORMITORYNAME ห้องพักพร้อมเฟอร์นิเจอร์ แอร์ ห้องน้ำในตัว จองออนไลน์ได้ทันที พร้อมระบบแจ้งปัญหาและประกาศถึงผู้เช่า",
      },
      { property: "og:title", content: "DORMITORYNAME | หอพักสะอาด ปลอดภัย ใกล้มหาวิทยาลัย" },
      {
        property: "og:description",
        content: "จองห้องพักออนไลน์ ดูผังห้องแบบเรียลไทม์ แจ้งปัญหาและรับประกาศจากผู้ดูแลได้ในที่เดียว",
      },
    ],
  }),
  component: Index,
});

const features = [
  { icon: ShieldCheck, title: "ปลอดภัย 24 ชม.", desc: "กล้องวงจรปิดและคีย์การ์ดทุกชั้น" },
  { icon: Wifi, title: "อินเทอร์เน็ตความเร็วสูง", desc: "Wi-Fi ไฟเบอร์ครอบคลุมทุกห้อง" },
  { icon: Car, title: "ที่จอดรถกว้างขวาง", desc: "รองรับทั้งรถยนต์และมอเตอร์ไซค์" },
  { icon: Building2, title: "ห้องพร้อมเข้าอยู่", desc: "เฟอร์นิเจอร์ครบ แอร์ ห้องน้ำในตัว" },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative flex min-h-[560px] items-center justify-center overflow-hidden">
        <img
          src="/images/building.jpg"
          alt="อาคารหอพัก DORMITORYNAME"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-hero-overlay/60" />
        <div className="relative z-10 mx-auto max-w-3xl animate-fade-in px-4 text-center">
          <h1 className="text-shadow-hero font-prompt text-4xl font-bold text-primary-foreground md:text-6xl">
            หอพัก DORMITORYNAME
          </h1>
          <p className="text-shadow-hero mt-4 text-lg text-primary-foreground/90 md:text-xl">
            ห้องพักสะอาด ปลอดภัย พร้อมเข้าอยู่ จองออนไลน์ได้ตลอด 24 ชั่วโมง
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/booking"
              className="rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
            >
              ดูห้องว่างและจอง
            </Link>
            <Link
              to="/contact"
              className="rounded-lg border border-primary-foreground/40 bg-card/10 px-8 py-3 font-semibold text-primary-foreground backdrop-blur-sm transition-colors hover:bg-card/20"
            >
              ติดต่อสอบถาม
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-center font-prompt text-3xl font-bold text-foreground">
          ทำไมต้องเลือกเรา
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-prompt text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary py-16">
        <div className="container mx-auto grid gap-8 px-4 md:grid-cols-2 md:items-center">
          <img
            src="/images/room2.jpg"
            alt="ตัวอย่างห้องพักภายในหอพัก"
            className="h-72 w-full rounded-2xl object-cover shadow-md"
            loading="lazy"
          />
          <div>
            <h2 className="font-prompt text-3xl font-bold text-foreground">ห้องพักของเรา</h2>
            <p className="mt-4 text-muted-foreground">
              ทุกห้องมีขนาดกว้างขวาง พร้อมเตียง ตู้เสื้อผ้า โต๊ะทำงาน เครื่องปรับอากาศ
              เครื่องทำน้ำอุ่น และห้องน้ำในตัว ดูแลความสะอาดส่วนกลางทุกวัน
            </p>
            <ul className="mt-6 space-y-2 text-sm text-foreground">
              <li>• ค่าเช่าเริ่มต้นเดือนละ 3,500 บาท</li>
              <li>• ค่ามัดจำ 2 เดือน + ค่าประกันห้อง 2,000 บาท</li>
              <li>• ไม่มีค่าส่วนกลางเพิ่มเติม</li>
            </ul>
            <Link
              to="/booking"
              className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              ดูผังห้องทั้งหมด
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card py-10">
        <div className="container mx-auto grid gap-6 px-4 text-sm text-muted-foreground sm:grid-cols-3">
          <div>
            <p className="font-prompt text-lg font-bold text-primary">DORMITORYNAME</p>
            <p className="mt-2">หอพักคุณภาพสำหรับนักศึกษาและคนทำงาน</p>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 text-primary" />
            <span>123 ถนนตัวอย่าง ตำบลในเมือง อำเภอเมือง จังหวัดตัวอย่าง 10000</span>
          </div>
          <div className="flex items-start gap-2">
            <Phone className="mt-0.5 h-4 w-4 text-primary" />
            <span>โทร. 08X-XXX-XXXX (ทุกวัน 08:00 - 20:00)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
