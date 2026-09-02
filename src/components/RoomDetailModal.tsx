import { useState } from "react";
import { ChevronLeft, ChevronRight, QrCode, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Room } from "@/components/FloorPlan";

interface RoomDetailModalProps {
  open: boolean;
  onClose: () => void;
  room: Room;
  onBooked?: () => void;
}

const roomImages = ["/images/room1.jpg", "/images/room2.jpg", "/images/room3.jpg"];

const statusLabels: Record<string, { label: string; className: string }> = {
  available: { label: "ว่าง", className: "bg-room-available text-primary-foreground" },
  occupied: { label: "มีผู้เช่า", className: "bg-room-occupied text-primary-foreground" },
  reserved: { label: "จองแล้ว", className: "bg-room-reserved text-foreground" },
};

const SECURITY_FEE = 2000;

const RoomDetailModal = ({ open, onClose, room, onBooked }: RoomDetailModalProps) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [showBooking, setShowBooking] = useState(false);
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % roomImages.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + roomImages.length) % roomImages.length);

  const status = statusLabels[room.status];
  const deposit = room.price * 2;
  const total = room.price + deposit + SECURITY_FEE;

  const handleClose = () => {
    setShowBooking(false);
    setCurrentImage(0);
    onClose();
  };

  const startBooking = () => {
    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบก่อนทำการจอง");
      void navigate({ to: "/auth" });
      return;
    }
    setShowBooking(true);
  };

  const confirmBooking = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("bookings").insert({
      room_id: room.id,
      user_id: user.id,
      total_amount: total,
      deposit_amount: deposit,
      security_amount: SECURITY_FEE,
      status: "pending",
    });
    setBusy(false);
    if (error) {
      toast.error("บันทึกการจองไม่สำเร็จ: " + error.message);
      return;
    }
    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "ส่งคำขอจองห้อง " + room.room_code,
      content: "รอผู้ดูแลตรวจสอบการชำระเงินและอนุมัติการจอง",
    });
    toast.success("ส่งคำขอจองเรียบร้อย", {
      description: "ผู้ดูแลจะตรวจสอบและยืนยันให้เร็วที่สุด",
    });
    onBooked?.();
    handleClose();
    void navigate({ to: "/dashboard" });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto overflow-hidden bg-card p-0">
        <DialogTitle className="sr-only">รายละเอียดห้อง {room.room_code}</DialogTitle>
        {!showBooking ? (
          <>
            <div className="relative aspect-[4/3] bg-muted">
              <img
                src={roomImages[currentImage]}
                alt={`ห้อง ${room.room_code} รูปที่ ${currentImage + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-2 backdrop-blur-sm transition-colors hover:bg-card"
                aria-label="รูปก่อนหน้า"
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-2 backdrop-blur-sm transition-colors hover:bg-card"
                aria-label="รูปถัดไป"
              >
                <ChevronRight className="h-5 w-5 text-foreground" />
              </button>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
                {roomImages.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setCurrentImage(i)}
                    aria-label={`รูปที่ ${i + 1}`}
                    className={`h-2.5 w-2.5 rounded-full transition-colors ${
                      i === currentImage ? "bg-primary" : "bg-card/60"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-prompt text-xl font-bold text-foreground">ห้อง {room.room_code}</h3>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                  {status.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-muted-foreground">ชั้น</p>
                  <p className="font-semibold text-foreground">{room.floor}</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-muted-foreground">ขนาดห้อง</p>
                  <p className="font-semibold text-foreground">{room.size} ตร.ม.</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-muted-foreground">ค่าเช่า/เดือน</p>
                  <p className="font-semibold text-primary">฿{room.price.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-muted-foreground">สิ่งอำนวยความสะดวก</p>
                  <p className="font-semibold text-foreground">แอร์, เฟอร์นิเจอร์</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                ห้องพักพร้อมเฟอร์นิเจอร์ครบชุด ประกอบด้วยเตียง, ตู้เสื้อผ้า, โต๊ะทำงาน, เครื่องปรับอากาศ
                และห้องน้ำในตัว
              </p>

              {room.status === "available" && (
                <button
                  onClick={startBooking}
                  className="w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  จองห้องนี้
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-6 p-6">
            <div className="text-center">
              <h3 className="mb-1 font-prompt text-xl font-bold text-foreground">ยืนยันการจอง</h3>
              <p className="text-sm text-muted-foreground">
                ห้อง {room.room_code} ชั้น {room.floor}
              </p>
            </div>

            <div className="space-y-3 rounded-xl bg-muted p-5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ค่าเช่ารายเดือน</span>
                <span className="font-semibold text-foreground">฿{room.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ค่ามัดจำ (2 เดือน)</span>
                <span className="font-semibold text-foreground">฿{deposit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ค่าประกันห้อง</span>
                <span className="font-semibold text-foreground">฿{SECURITY_FEE.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <span className="font-semibold text-foreground">รวมทั้งหมด</span>
                <span className="text-lg font-bold text-primary">฿{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <p className="text-sm font-medium text-foreground">สแกน QR Code เพื่อชำระเงิน</p>
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="relative flex h-48 w-48 items-center justify-center overflow-hidden rounded-lg bg-muted">
                  <div className="absolute inset-3 grid grid-cols-7 grid-rows-7 gap-0.5">
                    {Array.from({ length: 49 }).map((_, i) => {
                      const row = Math.floor(i / 7);
                      const col = i % 7;
                      const isCorner =
                        (row < 3 && col < 3) || (row < 3 && col > 3) || (row > 3 && col < 3);
                      const isFilled = isCorner || (row * 7 + col) % 3 === 0;
                      return (
                        <div
                          key={i}
                          className={`rounded-sm ${isFilled ? "bg-foreground" : "bg-transparent"}`}
                        />
                      );
                    })}
                  </div>
                  <QrCode className="absolute h-12 w-12 text-foreground/20" />
                </div>
              </div>
              <div className="space-y-1 text-center text-xs text-muted-foreground">
                <p>ชื่อบัญชี: DORMITORYNAME</p>
                <p>ธนาคาร: กสิกรไทย</p>
                <p>เลขที่บัญชี: XXX-X-XXXXX-X</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBooking(false)}
                className="flex-1 rounded-lg border border-border py-3 font-semibold text-foreground transition-colors hover:bg-muted"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={confirmBooking}
                disabled={busy}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                ชำระเงินแล้ว
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RoomDetailModal;
