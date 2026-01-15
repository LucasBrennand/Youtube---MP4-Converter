const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const ytDlpPath = path.join(__dirname, "..", "yt-dlp");
const cookiesPath = path.join(__dirname, "..", "youtube_cookies.txt");

if (process.env.YT_COOKIES) {
    try {
        fs.writeFileSync(cookiesPath, process.env.YT_COOKIES);
        console.log("Arquivo de cookies gerado com sucesso.");
    } catch (err) {
        console.error("Erro ao criar arquivo de cookies:", err);
    }
} else {
    console.warn("YT_COOKIES não encontrado nas variáveis de ambiente.");
}

app.get("/info", (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).json({ error: "URL Required" });

  const command = `${ytDlpPath} --cookies "${cookiesPath}" --extractor-args "youtube:player_client=android,web" --js-runtimes node --dump-json "${videoUrl}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Erro no yt-dlp:", stderr);
      return res.status(500).json({ error: "Erro ao processar vídeo. Verifique os cookies ou a URL." });
    }
    try {
      const videoData = JSON.parse(stdout);
      res.json({
        title: videoData.title,
        thumbnail: videoData.thumbnail,
        duration: videoData.duration_string,
      });
    } catch (e) {
      res.status(500).json({ error: "Error parsing data" });
    }
  });
});

app.get("/download", (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).send("URL required");
  const tempFileName = `temp_${Date.now()}.mp4`;
  const tempFilePath = path.join(__dirname, tempFileName);
  const command = `${ytDlpPath} --cookies "${cookiesPath}" --extractor-args "youtube:player_client=android,web" --js-runtimes node -f "best[ext=mp4]/best" --no-part -o "${tempFilePath}" "${videoUrl}"`;
  console.log("Baixando no servidor...");

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Erro no download:", stderr);
      return res.status(500).send("Download failed on server");
    }
    console.log("Download concluído no servidor. Enviando para o navegador...");

    res.download(tempFilePath, "video.mp4", (err) => {
      if (err) console.error("Erro ao enviar arquivo:", err);
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        console.log("🗑️ Arquivo temporário removido.");
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});