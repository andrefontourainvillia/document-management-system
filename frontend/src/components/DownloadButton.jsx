import { useState } from 'react';
import { getDownloadHeaders, getDownloadUrl } from '../services/documentService.js';

export default function DownloadButton({ documentId, userId }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');

  async function handleDownload() {
    setIsDownloading(true);
    setError('');
    try {
      const response = await fetch(getDownloadUrl(documentId), {
        headers: getDownloadHeaders(userId),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error?.message || 'Não foi possível baixar o documento.');
      }

      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = '';
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="download-action">
      <button className="download-button" type="button" onClick={handleDownload} disabled={isDownloading} aria-label="Baixar documento" title="Baixar documento">
        {isDownloading ? '...' : '↓'}
      </button>
      {error && <span className="download-error" role="alert">Falha ao baixar</span>}
    </div>
  );
}