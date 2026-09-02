# Home Hub

ผมทำได้บางส่วนก่อนเครดิตหมดครับ

ที่เสร็จแล้ว

ที่เก็บรูปแจ้งปัญหา (report-images) แบบส่วนตัว + สิทธิ์: เจ้าของอัปโหลด/ดู/ลบได้ ผู้ดูแลดูได้ทั้งหมด

สร้างโปรไฟล์และบทบาท "ผู้เช่า" อัตโนมัติเมื่อมีสมาชิกใหม่

ปิดสิทธิ์เรียกฟังก์ชันภายในระบบจากผู้ใช้ทั่วไป (แก้คำเตือนความปลอดภัย)

ระบบล็อกอินจริง: useAuth (ตรวจสิทธิ์ admin/tenant), หน้า Login/สมัครสมาชิกเชื่อมกับหลังบ้าน (อีเมล/รหัสผ่าน + Google), Navbar แสดงสถานะล็อกอินและปุ่มออกจากระบบ

หน้าจอง: ผังห้องดึงข้อมูลห้องจากฐานข้อมูลจริง และกด "ชำระเงินแล้ว" จะบันทึกคำขอจองลงตาราง bookings (สถานะ pending) พร้อมสร้างแจ้งเตือนให้ผู้เช่า

ที่ยังเหลือ

เพิ่ม route ใหม่ใน App.tsx + ห่อ AuthProvider และ ProtectedRoute (ตอนนี้ยังไม่ได้เพิ่ม จึงยังเข้า /dashboard, /admin ไม่ได้)

หน้า /dashboard ของผู้เช่า (ประวัติการจอง/แจ้งปัญหา)

หน้า /admin สำหรับผู้ดูแล: อนุมัติ/ปฏิเสธการจอง, ดูรายการแจ้งปัญหาพร้อมรูป, จัดการห้อง, โพสต์ประกาศ

หน้าแจ้งปัญหาให้บันทึกลงฐานข้อมูล + อัปโหลดรูปจริง

หน้าแจ้งเตือนให้ดึงจากตาราง announcements

ตั้งค่า Google provider และกำหนดบัญชี Admin คนแรก

Edge Function ส่งอีเมลแจ้งผู้ดูแล

เมื่อเติมเครดิตแล้วบอกผมได้เลย ผมจะทำต่อจากข้อ 1 ทันทีครับ

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://home-harmony-04.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ec7fa240-713c-4119-a3b3-6ecd054319f2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
