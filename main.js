const menuBtn = document.querySelector('.menu');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("tiktokUrl");
  const resultBox = document.getElementById("resultBox");

  function showErrorInline(message) {
    const box = document.getElementById("error-inline");
    const msg = document.getElementById("error-inline-msg");
    msg.textContent = message;
    box.style.display = "block";
    setTimeout(() => {
      box.style.display = "none";
    }, 4000);
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
      const res = await fetch(`/api/tiktok?url=${encodeURIComponent(tiktokUrl)}&token=my_super_secret_token_123`);


      const data = await res.json();

      if (data.code === 0 && data.data.length > 0) {
        resultBox.innerHTML = '';

        // Tạo select box để chọn chất lượng
        const select = document.createElement("select");
        select.style = "padding:10px;margin:10px 0;border-radius:6px;border:1px solid #ccc;width:100%;";

        data.data.forEach((item, index) => {
          const option = document.createElement("option");
          option.value = item.url;
          option.textContent = item.label;
          if (index === 0) option.selected = true;
          select.appendChild(option);
        });

        const btn = document.createElement("button");
        btn.textContent = "Download Selected";
        btn.style = "display:block;margin:10px 0;padding:10px;background:#28a745;color:#fff;border:none;border-radius:6px;cursor:pointer;";

        btn.onclick = () => {
          const selectedUrl = select.value;
          const a = document.createElement('a');
          a.href = `/api/download?url=${encodeURIComponent(selectedUrl)}`;
          a.download = "video.mp4";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        };

        resultBox.appendChild(select);
        resultBox.appendChild(btn);

      } else {
        showErrorInline("Không tìm thấy video phù hợp!");
      }

    } catch (error) {
      console.error("Lỗi gọi API TikTok:", error);
      showErrorInline("Lỗi kết nối tới máy chủ!");
    }
  });
});
