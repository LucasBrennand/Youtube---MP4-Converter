import { useState } from "react";
import axios from "axios";
import ParticlesBackground from "./components/ParticlesBackground";
import Footer from "./components/Footer";
import ErrorCard from "./components/ErrorCard";
import Loading from "./components/Loading";

function App() {
  const [url, setUrl] = useState("");
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setErrorMessage("Por favor, cole um link do YouTube.");
      return;
    }

    if (!url.includes("youtube.com/") && !url.includes("youtu.be/")) {
      setErrorMessage("Por favor, digite um link válido do YouTube.");
      return;
    }

    setLoading(true);
    setVideoData(null);
    setErrorMessage("");

    try {
      const response = await axios.get(
        `https://youtube-mp4-converter-c2qj.onrender.com/info?url=${encodeURIComponent(url)}`
      );
      setVideoData(response.data);
    } catch (err) {
      setErrorMessage("Ocorreu um erro ao buscar o vídeo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      <ParticlesBackground />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white p-4">
        <h1 className="text-5xl font-bold mb-6 text-center">YouTube MP4 Converter</h1>

        <div className="bg-slate-900/50 p-8 rounded-2xl backdrop-blur-md border border-slate-700 w-full max-w-md shadow-2xl">
          
          {errorMessage && (
            <div className="mb-4">
              <ErrorCard text={errorMessage} />
            </div>
          )}

          <input
            type="text"
            placeholder="Cole o link do YouTube aqui..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (errorMessage) setErrorMessage("");
            }}
            className="w-full p-3 rounded-lg bg-black/30 border border-slate-600 mb-4 focus:outline-none focus:border-red-500 transition-all"
          />

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full cursor-pointer bg-red-700 hover:bg-red-800 py-3 rounded-lg font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loading /> Analisando...
              </>
            ) : (
              "Analisar Vídeo"
            )}
          </button>

          {videoData && (
            <div className="mt-6 border-t border-slate-700 pt-6 animate-in fade-in zoom-in duration-300">
              <img src={videoData.thumbnail} className="w-full rounded-lg mb-4 shadow-lg" alt="thumb" />
              <h3 className="font-semibold text-lg mb-2">{videoData.title}</h3>
              <button onClick={() => window.location.href = `https://youtube-mp4-converter-c2qj.onrender.com/download?url=${encodeURIComponent(url)}`} className="w-full bg-green-600 py-3 rounded-lg font-bold">
                Baixar MP4
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;