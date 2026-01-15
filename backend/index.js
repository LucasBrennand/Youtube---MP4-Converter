const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();

// Configuração do CORS para permitir requisições do seu Frontend
app.use(cors());
app.use(express.json());

// Caminhos: O yt-dlp está na raiz (..) e o arquivo de cookies será criado lá também
const ytDlpPath = path.join(__dirname, "..", "yt-dlp");
const cookiesPath = path.join(__dirname, "..", "youtube_cookies.txt");

// 1. Lógica para criar o arquivo de cookies a partir da variável de ambiente do Render
if (process.env.YT_COOKIES) {
    try {
        fs.writeFileSync(cookiesPath, process.env.YT_COOKIES);
        console.log("✅ Arquivo de cookies gerado com sucesso.");
    } catch (err) {
        console.error("❌ Erro ao criar arquivo de cookies:", err);
    }
} else {
    console.warn("⚠️ Aviso: YT_COOKIES não encontrado nas variáveis de ambiente.");
}

// Rota para buscar informações do vídeo
app.get("/info", (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).json({ error: "URL Required" });

  // Comando usando os cookies e simulando cliente Android para evitar bloqueios
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

// Rota para realizar o download
app.get("/download", (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).send("URL required");

  const tempFileName = `temp_${Date.now()}.mp4`;
  const tempFilePath = path.join(__dirname, tempFileName);

  const command = `${ytDlpPath} --cookies "${cookiesPath}" --extractor-args "youtube:player_client=android,web" --js-runtimes node -f "best[ext=mp4]/best" --no-part -o "${tempFilePath}" "${videoUrl}"`;

  console.log("⬇️ Baixando no servidor...");

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Erro no download:", stderr);
      return res.status(500).send("Download failed on server");
    }

    console.log("✅ Download concluído no servidor. Enviando para o navegador...");

    res.download(tempFilePath, "video.mp4", (err) => {
      if (err) console.error("Erro ao enviar arquivo:", err);

      // Remove o arquivo temporário após o envio para o usuário
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        console.log("🗑️ Arquivo temporário removido.");
      }
    });
  });
});

// O Render fornece a porta via variável de ambiente PORT
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend rodando na porta ${PORT}`);
});