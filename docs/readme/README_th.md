<div align="center">
  <img src="../assets/logo.svg" alt="โลโก้ AxObfus" width="72" height="72" />

  # AxObfus

  **Counter-REA สำหรับ artifact ของคุณ โดย AlexDev**

  [เริ่มต้นใช้งาน](#เริ่มต้นใช้งาน) · [CLI และ MCP](../cli-and-mcp.md) · [ข้อจำกัดความรับผิด](../../DISCLAIMER.md) · [MIT License](../../LICENSE)
</div>

AxObfus (`axobfus`) เป็นชุดเครื่องมือป้องกันเชิงรับสำหรับซอฟต์แวร์ โมเดล และ build artifact ที่คุณเป็นเจ้าของหรือได้รับอนุญาตให้แก้ไข จุดประสงค์คือเพิ่มต้นทุนแก่ Reverse-Engineering Agents (REA) ด้วย decoys, resource exhaustion, semantic exhaustion และการเพิ่มปริมาณโทเคนที่ analyzer ต้องใช้

เครื่องมือนี้ช่วยเพิ่มความยากและความกำกวม แต่ **ไม่ได้ให้การป้องกันแบบสมบูรณ์** และไม่ควรใช้แทนการเก็บความลับไว้ฝั่งเซิร์ฟเวอร์หรือมาตรการป้องกันอื่น

## เริ่มต้นใช้งาน

ใช้ Node.js `^22.13.0 || >=24.0.0`

```bash
npx axobfus setup
npx axobfus harden .
```

`setup` ลงทะเบียน MCP และทักษะให้ coding agent ที่รองรับ ส่วน `harden` ค้นหา build output และเรียกขั้นตอนตรวจสอบ ป้องกัน และยืนยันผลในคำสั่งเดียว

## ควบคุมแต่ละขั้นตอนและบันทึกรายงาน

```bash
axobfus audit ./dist --report ./reports/audit.html
axobfus defend ./dist --report ./reports/defend.html
axobfus verify ./dist.protected ./dist
```

- `audit` อ่าน exposure และประเมินความเสี่ยงก่อนแก้ไข
- `defend` ใช้กลไกป้องกันกับ target ที่ระบุและตรวจสอบผลตาม pipeline
- `verify` เปรียบเทียบ artifact ที่ป้องกันแล้วกับต้นฉบับ
- `--report` สร้างรายงาน HTML แบบ standalone สำหรับ `audit` และ `defend` เปิดอ่านออฟไลน์หรือเก็บเป็น CI artifact ได้

ค่าประมาณโทเคนหรือต้นทุนในรายงานเป็นแบบจำลองเชิงประมาณการ ไม่ใช่ผลวัดสากลของ analyzer ทุกตัว และไม่ควรนำไปอ้างเป็น benchmark โดยไม่มีบริบทการทดลอง

## แนวทางป้องกัน

| ชั้น | วัตถุประสงค์ |
| --- | --- |
| Decoys | สร้าง metadata, diagnostics และ control flow ลวงที่ถูกต้องตามรูปแบบ เพื่อให้การอนุมานเบี่ยงจากตรรกะจริง |
| Resource exhaustion | เพิ่มภาระจาก header, nesting, interface, call graph และรายการที่ analyzer ต้องประมวลผล |
| Semantic exhaustion | เพิ่มจำนวนหลักฐานและเส้นทางที่ต้องให้เหตุผล ทำให้เกิดการตัดทอนหรือข้อสรุปที่ไม่ชัดเจน |
| Token consumption | เพิ่มข้อมูลและขั้นตอนที่โมเดลต้องอ่าน จึงเพิ่มการใช้โทเคนและต้นทุนการวิเคราะห์ |
| Verification | ตรวจ invariants และความเท่าเทียมของ runtime ตาม workload ก่อนเผยแพร่ |

AxObfus มีกลไกสำหรับ artifact หลายกลุ่ม เช่น JavaScript/TypeScript, Electron, WebAssembly, Python, SQLite, native binaries, model files และ mobile formats รายละเอียดและตัวเลือกอยู่ใน [CLI & MCP](../cli-and-mcp.md)

## การใช้งานอย่างรับผิดชอบ

ใช้กับ artifact ของตนเองหรือที่ได้รับอนุญาตชัดแจ้งเท่านั้น ทำงานบนสำเนาใน staging สำรองต้นฉบับ รัน `verify` และชุดทดสอบของผลิตภัณฑ์ทุกครั้ง รวมถึงตรวจรายงานก่อนเผยแพร่เพื่อไม่ให้หลุดข้อมูลที่ไม่ควรเปิดเผย

สำหรับผู้พัฒนา ชุดทดสอบของ repository สามารถเรียกด้วย `npm run build` และ `npm test` คำสั่งเหล่านี้เป็นข้อแนะนำในการตรวจสอบ **ไม่ใช่ข้อความยืนยันว่าทดสอบสำเร็จแล้ว** ในเอกสารนี้

## เครดิต

AxObfus โดย AlexDev พัฒนาต่อจาก BLA (Blind LLM Agents) ต้นฉบับที่ [qybaihe/bla](https://github.com/qybaihe/bla) ภายใต้ MIT License และคง attribution ของต้นฉบับไว้

- Repository: [AlexDev-TH/axobfus](https://github.com/AlexDev-TH/axobfus)
- [คู่มือติดตั้ง](../installation.md)
- [CLI & MCP](../cli-and-mcp.md)
- [Disclaimer](../../DISCLAIMER.md) · [MIT License](../../LICENSE)
