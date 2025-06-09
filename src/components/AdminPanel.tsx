import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

export function AdminPanel() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const importFromStorage = useAction(api.companies.importCompaniesFromStorage);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ imported: number; total: number } | null>(null);
  const [error, setError] = useState("");

  if (loggedInUser === undefined) return null;
  if (!loggedInUser?.isAdmin) {
    return <div className="text-red-600 font-bold">Acesso negado: apenas administradores.</div>;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setResult(null);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setProgress(0);
    setError("");
    setResult(null);
    try {
      // 1. Solicita URL de upload ao Convex
      const { url } = await generateUploadUrl();
      setProgress(10);
      // 2. Faz upload do arquivo para a URL
      const uploadRes = await fetch(url, {
        method: "POST",
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Falha no upload do arquivo para o storage do Convex");
      const { storageId } = await uploadRes.json();
      setProgress(40);
      // 3. Chama a action para importar
      const importResult = await importFromStorage({ fileId: storageId, userId: loggedInUser._id });
      setProgress(100);
      setResult(importResult);
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Painel de Administração - Importação Assíncrona</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        onClick={() => { void handleUpload(); }}
        disabled={!file || isUploading}
      >
        {isUploading ? "Importando..." : "Importar CSV"}
      </button>
      {isUploading && (
        <div className="my-4">
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="text-sm text-gray-700">Progresso: {progress}%</div>
        </div>
      )}
      {result && (
        <div className="mt-4 text-green-700 font-semibold">
          Importação concluída! {result.imported} de {result.total} registros importados.
        </div>
      )}
      {error && (
        <div className="mt-4 text-red-600 font-semibold">Erro: {error}</div>
      )}
    </div>
  );
} 