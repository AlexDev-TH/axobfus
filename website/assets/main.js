document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const text = button.getAttribute("data-copy") || "";
      const wrapper = button.closest(".command-wrap");
      const status = wrapper ? wrapper.querySelector(".copy-status") : null;
      let copied = false;

      try {
        if (!navigator.clipboard) throw new Error("Clipboard API unavailable");
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        try {
          copied = document.execCommand("copy");
        } catch {
          copied = false;
        }
        textarea.remove();
      }

      button.textContent = copied ? "คัดลอกแล้ว" : "คัดลอก";
      if (status) {
        status.textContent = copied ? "คัดลอกคำสั่งไปยังคลิปบอร์ดแล้ว" : "คัดลอกอัตโนมัติไม่ได้ โปรดเลือกคำสั่งด้านบน";
      }
      window.setTimeout(() => {
        button.textContent = "คัดลอก";
        if (status) status.textContent = "";
      }, 2400);
    });
  });
});
