import DownloadButton from './DownloadButton.jsx';

function formatFileSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentList({ documents, isLoading, userId }) {
  if (isLoading) return <p className="list-state">Carregando documentos...</p>;
  if (!documents.length) return <p className="list-state empty-state">Sua biblioteca ainda está vazia.</p>;

  return (
    <ul className="document-list">
      {documents.map((document) => (
        <li className="document-row" key={document.id}>
          <div className="document-mark" aria-hidden="true">DOC</div>
          <div className="document-info">
            <strong title={document.originalName}>{document.originalName}</strong>
            <span>{formatFileSize(document.size)} · {new Date(document.uploadedAt).toLocaleDateString('pt-BR')}</span>
          </div>
          <DownloadButton documentId={document.id} userId={userId} />
        </li>
      ))}
    </ul>
  );
}