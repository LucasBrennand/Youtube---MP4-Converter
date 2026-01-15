import { useState } from "react";
import axios from "axios";
import ParticlesBackground from "./components/ParticlesBackground";

function App() {
  const [url, setUrl] = useState("");
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleAnalyze = async () => {
    if (!url) return alert("Insira uma URL válida");

    setLoading(true);
    setVideoData(null);

    try {
      const response = await axios.get(
        `https://youtube-mp4-converter-c2qj.onrender.com/info?url=${encodeURIComponent(url)}`
      );
      setVideoData(response.data);
    } catch (error) {
      console.error(error);
      alert(
        "Erro ao buscar informações do vídeo. Verifique se o backend está rodando."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    window.location.href = `https://youtube-mp4-converter-c2qj.onrender.com/download?url=${encodeURIComponent(url)}`;
  };

  return (
    <div className="relative min-h-screen w-full">
      <ParticlesBackground />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white p-4">
        <h1 className="text-5xl font-bold mb-6 text-center">
          YouTube MP4 Converter
        </h1>

        <div className="bg-slate-900/50 p-8 rounded-2xl backdrop-blur-md border border-slate-700 w-full max-w-md shadow-2xl">
          <input
            type="text"
            placeholder="Cole o link do YouTube aqui..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-3 rounded-lg bg-black/30 border border-slate-600 mb-4 focus:outline-none focus:border-red-500 transition-all"
          />

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full cursor-pointer bg-red-700 hover:bg-red-800 py-3 rounded-lg font-bold transition-all disabled:opacity-50"
          >
            {loading ? "Analisando..." : "Analisar Vídeo"}
          </button>

          {videoData && (
            <div className="mt-6 border-t border-slate-700 pt-6 animate-in fade-in zoom-in duration-300">
              <img
                src={videoData.thumbnail}
                alt="Thumbnail"
                className="w-full rounded-lg mb-4 shadow-lg"
              />
              <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                {videoData.title}
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Duração: {videoData.duration}
              </p>

              <button
                onClick={handleDownload}
                className="w-full cursor-pointer bg-green-600 hover:bg-green-700 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
              >
                Baixar MP4
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
