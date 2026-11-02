# การติดตั้งและตั้งค่า AxObfus

**AxObfus โดย AlexDev** เผยแพร่เป็นแพ็กเกจ `axobfus` สำหรับใช้งานผ่าน CLI และ MCP server โดยต้องใช้ Node.js `^22.23.4 || >=24.0.0` และทำงานกับ artifact ที่คุณเป็นเจ้าของหรือได้รับอนุญาตเท่านั้น

## ใช้งานจากซอร์ส

```bash
git clone https://github.com/AlexDev-TH/axobfus.git
cd axobfus
npm ci
npm run build
node dist/cli.js doctor
node dist/cli.js harden .
```

## เริ่มต้นด้วย `npx` หลังเผยแพร่บน npm

เมื่อแพ็กเกจ `axobfus` เผยแพร่บน npm แล้ว ไม่จำเป็นต้องติดตั้ง global:

```bash
# ลงทะเบียน MCP server และทักษะกับ coding agent ที่รองรับ
npx axobfus setup

# ตรวจสภาพแวดล้อมและการลงทะเบียน
npx axobfus doctor

# สแกนโครงการและป้องกัน build output
npx axobfus harden .
```

ก่อนใช้งานจริง ควรสำรอง artifact ต้นฉบับและทำใน staging เสมอ

## ติดตั้งในโครงการหรือใช้แบบ global

สำหรับ CI/CD สามารถเพิ่มเป็น dev dependency ในโครงการของคุณ:

```bash
npm install --save-dev axobfus
# หรือ pnpm add -D axobfus
# หรือ bun add -d axobfus
```

หรือติดตั้ง global เพื่อเรียก CLI โดยตรง:

```bash
npm install --global axobfus
axobfus --help
axobfus doctor
```

## การตั้งค่า coding agent

```bash
npx axobfus setup
```

คำสั่งนี้ค้นหา client ที่รองรับและลงทะเบียน MCP server `axobfus` พร้อมทักษะ Counter-REA รองรับ workflow ของ Claude Code, Cursor, Codex, Windsurf, Gemini CLI และ client อื่นที่เครื่องมือตรวจพบ

เลือก client เฉพาะรายการได้:

```bash
npx axobfus setup --client claude-code,cursor
```

หลังตั้งค่า สามารถขอให้ agent ช่วยในเชิงป้องกัน เช่น:

```text
Audit โฟลเดอร์ ./dist ของฉัน บันทึกรายงาน แล้วเสนอแผนป้องกัน REA โดยไม่แก้ไขต้นฉบับ
```

ถอนการลงทะเบียนด้วย:

```bash
npx axobfus uninstall
```

## ใช้ CLI แยกขั้นตอน

```bash
# 1. ตรวจ exposure และบันทึกรายงาน HTML
axobfus audit ./dist --report ./reports/audit.html

# 2. ป้องกัน target ที่ระบุ และเก็บผล pipeline
axobfus defend ./dist --report ./reports/defend.html

# 3. ตรวจสอบเทียบกับต้นฉบับที่สำรองไว้
axobfus verify ./dist.protected ./dist
```

`--report` รองรับ `audit` และ `defend` สำหรับสร้าง HTML แบบ standalone ที่เปิดออฟไลน์ได้โดยไม่มีสคริปต์หรือทรัพยากรภายนอก เหมาะสำหรับ review และจัดเก็บใน CI ควรจัดการสิทธิ์ไฟล์และตรวจข้อมูลในรายงานก่อนเผยแพร่ รายงานไม่ใช่หลักฐานว่าป้องกัน analyzer ได้ทุกตัว

## ใช้ใน release pipeline

ตัวอย่าง script ใน `package.json` ของโครงการที่ใช้ AxObfus:

```json
{
  "scripts": {
    "build": "vite build",
    "protect": "axobfus harden ."
  }
}
```

หลัง build และ protect ให้รัน `verify` รวมถึง test suite ของผลิตภัณฑ์ตาม workload จริง ห้ามถือว่าคำสั่งป้องกันแทนการทดสอบซอฟต์แวร์ได้

## Native header integration

สำหรับ C/C++, Rust หรือ Go สามารถสร้าง header สำหรับฝังกลไกป้องกันตอน compile ได้:

```bash
npx axobfus emit-headers ./include/shield --seed my-release-v1
```

ตรวจไฟล์ที่สร้างและวิธีเชื่อมเข้ากับ build ของคุณก่อนใช้งานจริง รายละเอียดคำสั่งทั้งหมดอยู่ใน [CLI & MCP](cli-and-mcp.md)

## ข้อควรจำ

- AxObfus เพิ่ม decoys, ภาระด้าน resource/semantic และการใช้โทเคนของ analyzer ไม่ได้รับประกันความลับสมบูรณ์
- เก็บ private key, master secret และข้อมูลสำคัญไว้ฝั่งเซิร์ฟเวอร์
- ตัวเลขประมาณการในรายงานไม่ใช่ผล benchmark ที่ใช้ได้กับทุกสภาพแวดล้อม
- อ่าน [DISCLAIMER](../DISCLAIMER.md) ก่อนใช้งาน
