import { createFileRoute } from "@tanstack/react-router";
import Navbar from "@/components/Navbar";
import FloorPlan from "@/components/FloorPlan";

export const Route = createFileRoute("/booking")({
  head: () => ({
    meta: [
      { title: "จองห้องพัก | DORMITORYNAME" },
      {
        name: "description",
        content: "ดูผังห้องพักแต่ละชั้นแบบเรียลไทม์ เช็คห้องว่าง ราคา และจองห้องออนไลน์ได้ทันที",
      },
      { property: "og:title", content: "จองห้องพัก | DORMITORYNAME" },
      {
        property: "og:description",
        content: "เลือกชั้น เลือกห้อง ดูรายละเอียดและจองห้องพักออนไลน์ได้ตลอด 24 ชั่วโมง",
      },
    ],
  }),
  component: BookingPage,
});

function BookingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="font-prompt text-3xl font-bold text-foreground md:text-4xl">จองห้องพัก</h1>
          <p className="mt-2 text-muted-foreground">
            เลือกชั้นและห้องที่ต้องการ ระบบจะแสดงสถานะห้องแบบเรียลไทม์
          </p>
        </div>
        <FloorPlan />
      </div>
    </div>
  );
}
