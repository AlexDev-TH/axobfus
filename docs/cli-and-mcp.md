# คู่มือ CLI, รายงาน และ MCP ของ AxObfus

แพ็กเกจและ CLI ใช้ชื่อ `axobfus` สำหรับปกป้อง artifact ที่ผู้ใช้เป็นเจ้าของหรือได้รับอนุญาตจากการวิเคราะห์ย้อนกลับอัตโนมัติ โดยเน้น decoys, resource/semantic exhaustion และการเพิ่ม token consumption ไม่ใช่การรับประกันการป้องกันแบบสมบูรณ์

## เริ่มต้นด่วน

```bash
npx axobfus setup
npx axobfus harden .
```

- `setup` ลงทะเบียน MCP server และทักษะให้ coding agent ที่รองรับ
- `harden .` ค้นหา build output และทำ audit → protect → verify ใน workflow เดียว
- ควรรันใน staging และเก็บต้นฉบับไว้สำหรับ `verify`

## คำสั่งหลัก

| คำสั่ง | หน้าที่ |
| --- | --- |
| `axobfus setup` | ตั้งค่า MCP server และทักษะให้ client ที่ตรวจพบ |
| `axobfus harden <directory>` | ค้นหา artifact และเรียก pipeline ป้องกันโครงการ |
| `axobfus audit <target>` | ตรวจ exposure, จุดเสี่ยง REA และประมาณภาระการวิเคราะห์ |
| `axobfus defend <target>` | รัน pipeline ตรวจ release, audit, protect และ verify กับ target ที่ระบุ |
| `axobfus protect <target> [-o <output>]` | ใช้ shield เฉพาะขั้นตอนและเลือก output ได้ |
| `axobfus verify <target> [original]` | ตรวจ invariants และเปรียบเทียบกับต้นฉบับ |
| `axobfus inspect-release <target>` | สแกน source map และสัญลักษณ์ที่เปิดเผยแบบอ่านอย่างเดียว |
| `axobfus doctor` | ตรวจสภาพแวดล้อม เอนจิน และการลงทะเบียน MCP |
| `axobfus emit-headers` | สร้าง native defense headers สำหรับ C/C++, Rust หรือ Go |
| `axobfus benchmark` | รันชุดประเมินในสภาพแวดล้อมของผู้ใช้ ไม่ใช่ผลลัพธ์สำเร็จรูปของ AxObfus |

ดูตัวเลือกที่เวอร์ชันติดตั้งรองรับด้วย `axobfus <command> --help`

## บันทึกรายงานด้วย `--report`

ใช้ `--report <path>` กับ `audit` และ `defend` เพื่อสร้างรายงาน HTML แบบ standalone ที่เปิดอ่านออฟไลน์ได้โดยไม่มีสคริปต์หรือทรัพยากรภายนอก:

```bash
axobfus audit ./dist --report ./reports/audit.html
axobfus defend ./dist --report ./reports/defend.html
axobfus verify ./dist.protected ./dist
```

ตัวอย่างการตรวจ artifact เดียว:

```bash
axobfus audit ./dist/app.js --report ./reports/app-audit.html
axobfus defend ./dist/app.js --report ./reports/app-defend.html
axobfus verify ./dist/app.protected.js ./dist/app.js
```

รายงานเหมาะสำหรับ:

- เก็บเป็นหลักฐานตรวจทานใน release หรือ CI
- เปรียบเทียบ exposure และ invariants ระหว่างการรัน
- ดูรายการ decoy, resource budget และ semantic workload ที่เกี่ยวข้อง
- อ่านค่าประมาณ token consumption ควบคู่กับข้อจำกัดของแบบจำลอง

รายงานเป็นเพียงผลจาก target และสภาพแวดล้อมนั้น ไม่ใช่การรับรองความปลอดภัยหรือ benchmark สากล ควรตรวจข้อมูลที่อาจ sensitive ก่อนแชร์ไฟล์

## ตัวเลือกที่เกี่ยวข้องกับการป้องกัน

- `--intensity <level>`: เลือกระดับที่คำสั่งรองรับ เช่น `stealth`, `balanced`, `maximum`, `bankrupt`
- `--seed <value>`: กำหนด seed ต่อโครงการเพื่อการสร้าง decoy ที่ควบคุมได้ ไม่ควรใช้ fingerprint ร่วมกันทุกโครงการ
- `--manifest`: สร้าง unsigned defense manifest เมื่อเลือกเปิดใช้งาน ไม่ใช่ลายเซ็นดิจิทัล
- `--llm-directives`: เปิดชั้น directive ที่มีความเสี่ยงเฉพาะเมื่อเข้าใจผลกระทบ ค่าเริ่มต้นปิดอยู่

## MCP server `axobfus`

หลัง `npx axobfus setup` coding agent ที่รองรับสามารถเรียก tool ต่อไปนี้:

| Tool | หน้าที่ |
| --- | --- |
| `axobfus_harden` | ป้องกันโครงการจาก directory |
| `axobfus_audit` | ตรวจ exposure และ token economics |
| `axobfus_defend` | รัน pipeline ป้องกันเต็มรูปแบบ |
| `axobfus_protect` | ใช้ shield กับ input/output ที่ระบุ |
| `axobfus_verify` | ตรวจสอบ target เทียบ original |
| `axobfus_benchmark` | รันชุดประเมินในเครื่องผู้ใช้ |
| `axobfus_emit_headers` | สร้าง native headers |
| `axobfus_doctor` | ตรวจการตั้งค่าและความพร้อม |

พารามิเตอร์สำคัญ ได้แก่ `path` หรือ `input_path`, `output_path`, `original_path`, `intensity`, `seed`, `emit_manifest` และ `llm_directives` โดยค่าเริ่มต้นของ manifest และ LLM directives คือปิด สำหรับรายงาน HTML จาก CLI ใช้ `--report` ตามตัวอย่างด้านบน

ตัวอย่าง prompt:

```text
เรียก axobfus_audit กับ ./dist แล้วสรุป exposure โดยไม่แก้ไฟล์
```

## การตรวจสอบก่อน release

`verify` ไม่แทน test suite ของผลิตภัณฑ์ ควรทดสอบ functional behavior, performance, signing, packaging และ compatibility ตาม workload ของคุณ ผู้ดูแล source สามารถรัน `npm run build` และ `npm test` ใน environment ที่เหมาะสม ข้อความนี้ไม่ได้อ้างว่าชุดทดสอบถูกรันหรือผ่านแล้ว

อ่านข้อจำกัดด้านการใช้งานใน [DISCLAIMER](../DISCLAIMER.md)
