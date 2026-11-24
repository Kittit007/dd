# ระบบลงทะเบียนนักเรียนนักศึกษา วิทยาลัยเทคนิคนางรอง

## โครงสร้างไฟล์
- `index.html` — หน้าฟอร์มลงทะเบียน แดชบอร์ดตรวจสอบรายชื่อ และใบยืนยันการสมัครที่สั่งพิมพ์ได้
- `css/style.css` — สไตล์โทนสีเขียว-ขาว ตัดทอง และรองรับการสั่งพิมพ์ (`@media print`)
- `js/config.js` — ตั้งค่า Supabase URL, Anon Key และข้อมูลหลักสูตร/สาขาวิชา
- `js/db.js` — ฟังก์ชันเชื่อมต่อฐานข้อมูล Supabase และอัปโหลดรูปภาพเข้า Storage
- `js/app.js` — ควบคุมการทำงานของหน้าเว็บ
- `sql/schema.sql` — สคริปต์ SQL สำหรับสร้างตาราง `departments`, `students` และ Storage Bucket `student-documents`

## วิธีใช้งาน
1. เปิดโปรเจกต์บน Supabase แล้วนำโค้ดใน `sql/schema.sql` ไปรันใน **SQL Editor**
2. แก้ไข `URL` และ `ANON_KEY` ในไฟล์ `js/config.js` ให้ตรงกับโปรเจกต์ Supabase ของคุณ
3. เปิด `index.html` ผ่าน Web Server หรืออัปโหลดขึ้นโฮสติ้งได้เลย
