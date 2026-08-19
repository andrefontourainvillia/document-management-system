const { createError } = require('../utils/createError');

class DocumentController {
  constructor(documentService) {
    this.documentService = documentService;
  }

  upload = async (request, response, next) => {
    try {
      if (!request.file) {
        return next(createError('FILE_REQUIRED', 'É necessário enviar um arquivo.', 400));
      }
      response.status(201).json(await this.documentService.upload(request.file, request.userId));
    } catch (error) {
      next(error);
    }
  };

  list = (request, response, next) => {
    try {
      response.json({ documents: this.documentService.list(request.userId) });
    } catch (error) {
      next(error);
    }
  };

  download = async (request, response, next) => {
    try {
      const { document, filePath } = await this.documentService.getDownload(request.params.id, request.userId);
      response.type(document.mimeType);
      response.attachment(document.originalName);
      response.sendFile(filePath, error => {
        if (error && !response.headersSent) next(error);
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { DocumentController };