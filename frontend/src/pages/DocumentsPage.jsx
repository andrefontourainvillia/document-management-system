import { useCallback, useEffect, useState } from 'react';
import DocumentList from '../components/DocumentList.jsx';
import UploadComponent from '../components/UploadComponent.jsx';
import { DEFAULT_USER_ID, listDocuments, uploadDocument } from '../services/documentService.js';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const refreshDocuments = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      setDocuments(await listDocuments(DEFAULT_USER_ID));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  async function handleUpload(file) {
    setIsUploading(true);
    setError('');
    setSuccess('');
    try {
      await uploadDocument(file, DEFAULT_USER_ID);
      setSuccess('Documento enviado com sucesso.');
      await refreshDocuments();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <p className="eyebrow">Arquivo pessoal</p>
        <h1>Seus documentos</h1>
        <p className="intro">Envie, organize e baixe seus arquivos em um só lugar.</p>
      </header>

      <section className="workspace" aria-label="Gerenciamento de documentos">
        <UploadComponent onUpload={handleUpload} isUploading={isUploading} />
        <div className="documents-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Biblioteca</p>
              <h2>Arquivos disponíveis</h2>
            </div>
            <span className="document-count">{documents.length}</span>
          </div>

          {error && <p className="feedback feedback-error" role="alert">{error}</p>}
          {success && <p className="feedback feedback-success" role="status">{success}</p>}
          <DocumentList documents={documents} isLoading={isLoading} userId={DEFAULT_USER_ID} />
        </div>
      </section>
    </main>
  );
}