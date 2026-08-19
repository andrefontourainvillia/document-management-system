import { useRef, useState } from 'react';

export default function UploadComponent({ onUpload, isUploading }) {
  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();
    if (selectedFile) onUpload(selectedFile);
  }

  function handleChange(event) {
    setSelectedFile(event.target.files?.[0] || null);
  }

  return (
    <section className="upload-panel" aria-labelledby="upload-title">
      <p className="panel-kicker">Novo arquivo</p>
      <h2 id="upload-title">Adicione um documento</h2>
      <p className="panel-copy">Selecione um arquivo para guardar na sua biblioteca.</p>
      <form onSubmit={handleSubmit}>
        <label className="file-picker" htmlFor="document-file">
          <span className="file-icon" aria-hidden="true">+</span>
          <span>{selectedFile ? selectedFile.name : 'Escolher arquivo'}</span>
          <input ref={inputRef} id="document-file" name="file" type="file" onChange={handleChange} />
        </label>
        <button className="primary-button" type="submit" disabled={!selectedFile || isUploading}>
          {isUploading ? 'Enviando...' : 'Enviar documento'}
        </button>
      </form>
    </section>
  );
}