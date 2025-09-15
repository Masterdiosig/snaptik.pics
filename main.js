const menuBtn = document.querySelector('.menu');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("tiktokUrl");
  const resultBox = document.getElementById("resultBox");

  function showErrorInline(message) {
    alert(message); 
  }

  document.getElementById("downloadForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const tiktokUrl = input.value.trim();

    if (!tiktokUrl) {
      showErrorInline("Paste valid link!");
      input.focus();
      return;
    }

    try {
      const res = await fetch('/api/tiktok', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer my_super_secret_token_123'
        },
        body: JSON.stringify({ url: tiktokUrl })
      });

      const data = await res.json();

      if (data.code === 0 && data.data.length > 0) {
        resultBox.innerHTML = '';
        for (const item of data.data) {
          const btn = document.createElement("button");
          btn.textContent = item.label;
          btn.style = "display:block;margin:10px 0;padding:10px;background:#007bff;color:#fff;border:none;border-radius:6px;cursor:pointer;";

          btn.onclick = () => {
            window.location.href = `/api/download?url=${encodeURIComponent(item.url)}`;
          };

          resultBox.appendChild(btn);
        }
      } else {
        showErrorInline("Không tìm thấy video phù hợp!");
      }

    } catch (error) {
      console.error("Lỗi gọi API TikTok:", error);
      showErrorInline("Lỗi kết nối tới máy chủ!");
    }
  });
});
