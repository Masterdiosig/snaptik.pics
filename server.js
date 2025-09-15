import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Trang test đơn giản
app.get("/", (req, res) => {
  res.send(`
    <form id="testForm" method="POST" action="/api/tiktok">
      <input type="url" name="url" placeholder="TikTok URL..." required style="width:300px">
      <button type="submit">⬇️ Test tải video</button>
    </form>
    <p>Nhớ gọi qua fetch hoặc Postman để test với header Authorization.</p>
  `);
});

// API TikTok (POST)
app.post("/api/tiktok", async (req, res) => {
  try {
    const { url } = req.body;
    const token = req.headers.authorization?.replace("Bearer ", "");

    // Kiểm tra token
    if (token !== "my_super_secret_token_123") {
      return res.status(403).json({ error: "⛔ Sai token" });
    }

    if (!url) {
      return res.status(400).json({ error: "❌ Thiếu URL TikTok" });
    }

    // Gọi RapidAPI
    const apiRes = await axios.get(
      "https://tiktok-download-video1.p.rapidapi.com/newGetVideo",
      {
        params: { url, hd: "1" },
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "tiktok-download-video1.p.rapidapi.com",
        },
      }
    );
console.log("📦 RapidAPI response:", JSON.stringify(apiRes.data, null, 2));
    const data = apiRes.data?.data || {};
    const hdNoLogo = data.hdplay;
    const sdNoLogo = data.play;
    const withLogo = data.wmplay;

    if (!hdNoLogo && !sdNoLogo && !withLogo) {
      return res.status(500).json({ error: "❌ Không lấy được video" });
    }

    // Trả về danh sách chất lượng
    const result = [];
    if (hdNoLogo) result.push({ label: "HD (No Logo)", url: hdNoLogo });
    if (sdNoLogo) result.push({ label: "SD (No Logo)", url: sdNoLogo });
    if (withLogo) result.push({ label: "With Logo", url: withLogo });

    return res.json({
      code: 0,
      data: result,
    });
  } catch (err) {
    console.error("❌ Lỗi server:", err.response?.data || err.message);
    return res.status(500).json({ error: "⚠️ Lỗi xử lý video" });
  }
});

// API tải xuống (stream)
app.get("/api/download", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "❌ Thiếu URL" });

    const response = await axios.get(url, { responseType: "stream" });

    res.setHeader("Content-Disposition", 'attachment; filename="video.mp4"');
    res.setHeader("Content-Type", "video/mp4");

    response.data.pipe(res);
  } catch (err) {
    console.error("❌ Lỗi tải video:", err.message);
    res.status(500).json({ error: "⚠️ Không tải được video" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});

