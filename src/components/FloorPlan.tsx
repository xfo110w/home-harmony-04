import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import RoomDetailModal from "@/components/RoomDetailModal";
import { supabase } from "@/integrations/supabase/client";

export type RoomStatus = "available" | "occupied" | "reserved";

export interface Room {
  id: string;
  room_code: string;
  floor: number;
  number: number;
  status: RoomStatus;
  price: number;
  size: number;
}

const statusColors: Record<RoomStatus, string> = {
  available: "bg-room-available text-primary-foreground hover:opacity-80",
  occupied: "bg-room-occupied text-primary-foreground hover:opacity-80",
  reserved: "bg-room-reserved text-foreground hover:opacity-80",
};

const FloorPlan = () => {
  const [currentFloor, setCurrentFloor] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data } = await supabase
        .from("rooms")
        .select("id, room_code, floor, number, status, price, size")
        .order("floor")
        .order("number");
      return (data ?? []) as Room[];
    },
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  const rooms = data ?? [];
  const loading = isLoading;
  const load = () => {
    void refetch();
  };


  const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b);
  const maxFloor = floors[floors.length - 1] ?? 1;
  const minFloor = floors[0] ?? 1;
  const floorRooms = rooms.filter((r) => r.floor === currentFloor);
  const half = Math.ceil(floorRooms.length / 2);
  const leftRooms = floorRooms.slice(0, half);
  const rightRooms = floorRooms.slice(half);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 text-center">
        <h2 className="font-prompt text-2xl font-bold text-foreground">ชั้นที่ {currentFloor}</h2>
        <p className="mt-1 text-sm text-muted-foreground">กดที่ห้องเพื่อดูรายละเอียด</p>
      </div>

      <div className="mb-6 flex justify-center gap-6">
        <div className="flex items-center gap-2 text-sm">
          <div className="h-4 w-4 rounded bg-room-available" />
          <span className="text-muted-foreground">ว่าง</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="h-4 w-4 rounded bg-room-occupied" />
          <span className="text-muted-foreground">มีผู้เช่า</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="h-4 w-4 rounded bg-room-reserved" />
          <span className="text-muted-foreground">จองแล้ว</span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-floor-bg p-6 shadow-sm">
        <div className="flex gap-4">
          <div className="grid flex-1 grid-cols-5 gap-2">
            {leftRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg text-xs font-semibold transition-all ${statusColors[room.status]}`}
              >
                <span className="text-[10px] opacity-80">ห้อง</span>
                <span>{room.room_code}</span>
              </button>
            ))}
          </div>

          <div className="flex min-w-[80px] flex-col items-center gap-2">
            <button
              onClick={() => setCurrentFloor((f) => Math.min(f + 1, maxFloor))}
              disabled={currentFloor >= maxFloor}
              className="flex items-center gap-1 rounded-lg bg-stairs px-3 py-2 text-xs font-medium text-foreground transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronUp className="h-4 w-4" />
              <span>ขึ้น</span>
            </button>

            <div className="flex min-h-[100px] w-full flex-1 items-center justify-center rounded-lg bg-hallway">
              <span className="text-xs font-medium text-muted-foreground [writing-mode:vertical-lr]">
                โถงชั้น {currentFloor}
              </span>
            </div>

            <button
              onClick={() => setCurrentFloor((f) => Math.max(f - 1, minFloor))}
              disabled={currentFloor <= minFloor}
              className="flex items-center gap-1 rounded-lg bg-stairs px-3 py-2 text-xs font-medium text-foreground transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronDown className="h-4 w-4" />
              <span>ลง</span>
            </button>
          </div>

          <div className="grid flex-1 grid-cols-5 gap-2">
            {rightRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg text-xs font-semibold transition-all ${statusColors[room.status]}`}
              >
                <span className="text-[10px] opacity-80">ห้อง</span>
                <span>{room.room_code}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedRoom && (
        <RoomDetailModal
          open={!!selectedRoom}
          onClose={() => setSelectedRoom(null)}
          room={selectedRoom}
          onBooked={load}
        />
      )}
    </div>
  );
};

export default FloorPlan;
