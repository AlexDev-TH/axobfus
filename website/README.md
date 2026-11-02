# AxObfus Website

เว็บไซต์นำเสนอ **AxObfus โดย AlexDev** สำหรับ repository [AlexDev-TH/axobfus](https://github.com/AlexDev-TH/axobfus) เป็นหน้า static HTML/CSS/JavaScript ภาษาไทย ใช้งานได้โดยไม่มี build step และไม่มี remote runtime dependency

## หน้าเว็บ

- `/` — ภาพรวม defensive Counter-REA, decoys, resource/semantic exhaustion และ token consumption
- `/get-started/` — `npx axobfus setup`, `npx axobfus harden .`, `audit`, `defend`, `verify`
- `/showcase/` — แนวทางประเมินจาก artifact และรายงานของผู้ใช้ ไม่นำ benchmark ของ upstream มาเป็นผล AxObfus
- `/faq/` — การติดตั้ง รายงาน verification และข้อจำกัด
- `/guides/` และ `/crackme/` — คำแนะนำเสริมสำหรับ format-aware defense และ self-assessment

## รายงาน

ตัวอย่าง `--report` ใช้กับ `audit` และ `defend`:

```bash
axobfus audit ./dist --report ./reports/audit.html
axobfus defend ./dist --report ./reports/defend.html
```

รายงานเป็น HTML แบบ standalone เปิดออฟไลน์ได้โดยไม่มีสคริปต์หรือทรัพยากรภายนอก เหมาะสำหรับ review หรือจัดเก็บเป็น CI artifact ไม่ใช่ใบรับรองความปลอดภัย ค่าประมาณโทเคนต้องไม่ถูกนำเสนอเป็นผลวัดสากล การรองรับ `--report` ใน `harden` เป็นตัวเลือกเพิ่มเติม ไม่ใช่สัญญาหลักของเอกสารนี้

## การพัฒนา

เปิด `index.html` โดยตรงหรือ serve ไดเรกทอรี `website/` ด้วย static server ที่มีอยู่ ไม่ต้องติดตั้ง dependency เพิ่ม ใช้ `assets/styles.css` ร่วมกันทุกหน้า และ `assets/main.js` เฉพาะปุ่มคัดลอกที่มี fallback

โลโก้และ social card เป็น SVG ท้องถิ่นใน `assets/` และ `../docs/assets/` ไฟล์ PNG และ SVG รุ่นก่อนอาจยังอยู่เพื่อไม่ลบ binary ที่ไม่คุ้นเคย แต่หน้าและ README ปัจจุบันไม่อ้างถึงไฟล์เหล่านั้น

ไม่มีการอ้างว่าชุดทดสอบถูกรันจากการแก้เอกสารหรือเว็บไซต์ เมื่อเปลี่ยน source ให้รัน `npm run build` และ `npm test` แล้วรายงานผลจริง
