const crypto = require('node:crypto');

class DocumentService {
  constructor({ metadataRepository, fileRepository }) {
    this.metadataRepository = metadataRepository;
    this.fileRepository = fileRepository;
  }

  async upload(uploadedFile, owner) {
    const id = crypto.randomUUID();
    const metadata = {
      id,
      originalName: uploadedFile.originalname,
      storedName: uploadedFile.filename,
      size: uploadedFile.size,
      mimeType: uploadedFile.mimetype,
      uploadedAt: new Date().toISOString(),
      owner
    };

    try {
      await this.fileRepository.save(uploadedFile);
      return this.publicMetadata(await this.metadataRepository.create(metadata));
    } catch (error) {
      await this.fileRepository.remove(uploadedFile.filename).catch(() => {});
      if (!error.code) {
        error.code = 'STORAGE_ERROR';
        error.status = 500;
        error.message = 'Não foi possível armazenar o documento.';
      }
      throw error;
    }
  }

  list(owner) {
    return this.metadataRepository.findByOwner(owner).map(document => this.publicMetadata(document));
  }

  async getDownload(id, owner) {
    const document = this.metadataRepository.findById(id);
    if (!document) {
      throw this.error('DOCUMENT_NOT_FOUND', 'Documento não encontrado.', 404);
    }
    if (document.owner !== owner) {
      throw this.error('DOCUMENT_FORBIDDEN', 'Você não tem acesso a este documento.', 403);
    }
    if (!await this.fileRepository.exists(document.storedName)) {
      throw this.error('DOCUMENT_NOT_FOUND', 'Documento não encontrado.', 404);
    }
    return { document, filePath: this.fileRepository.getPath(document.storedName) };
  }

  publicMetadata({ storedName, ...metadata }) {
    return metadata;
  }

  error(code, message, status) {
    const error = new Error(message);
    error.code = code;
    error.status = status;
    return error;
  }
}

module.exports = { DocumentService };