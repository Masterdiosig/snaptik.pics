import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

app.post("/api/tiktok", async (req, res) => {
  const { url } = req.body;
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (token !== "my_super_secret_token_123") {
    return res.status(403).json({ code: 1, error: "⛔ Sai token" });
  }

  if (!url) {
    return res.status(400).json({ code: 2, error: "❌ Thiếu URL TikTok" });
  }

  try {
    const apiRes = await axios.get("https://tiktok-download-video1.p.rapidapi.com/newGetVideo", {
      params: { url, hd: "1" },
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "tiktok-download-video1.p.rapidapi.com",
      },
    });

    const data = apiRes.data?.data || {};
    const videoUrl = data.hdplay || data.play || data.wmplay;

    if (!videoUrl) {
      return res.json({ code: 3, data: [] });
    }

    res.json({
      code: 0,
      data: [{ label: "Download Video", url: videoUrl }]
    });
  } catch (err) {
    console.error("❌ Lỗi API:", err.response?.data || err.message);
    res.status(500).json({ code: 4, error: "⚠️ Lỗi xử lý video" });
  }
});

app.get("/api/download", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("Thiếu URL");

  try {
    const response = await axios.get(url, {
      responseType: "stream",
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", 'attachment; filename="video.mp4"');
    response.data.pipe(res);
  } catch (err) {
    console.error("❌ Lỗi tải:", err.message);
    res.status(500).send("Không tải được video.");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});
