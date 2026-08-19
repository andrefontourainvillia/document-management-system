// Seed do servidor backend do Document Management System.
//
// Este arquivo é apenas um ponto de partida mínimo. Ao longo do workshop você
// vai usar o Agent Mode do GitHub Copilot para construir as camadas:
//   - routes/       (definição das rotas)
//   - controllers/  (entrada HTTP e validação)
//   - services/     (regras de negócio)
//   - repositories/ (persistência: arquivos locais + metadados em memória)
//
// Restrição do projeto: uploads são gravados no filesystem local da aplicação
// usando multer com diskStorage. Não utilize provedores externos.

const express = require('express');
const multer = require('multer');
const config = require('./config');
const { DocumentController } = require('./controllers/documentController');
const { DocumentMetadataRepository } = require('./repositories/documentMetadataRepository');
const { LocalFileRepository } = require('./repositories/localFileRepository');
const { DocumentService } = require('./services/documentService');
const { createDocumentRoutes } = require('./routes/documentRoutes');

const app = express();
const metadataRepository = new DocumentMetadataRepository();
const fileRepository = new LocalFileRepository(config.storageDirectory);
const documentService = new DocumentService({ metadataRepository, fileRepository });
const documentController = new DocumentController(documentService);

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((request, response, next) => {
  const userId = request.get('X-User-Id');
  if (!userId || !userId.trim()) {
    const error = new Error('O cabeçalho X-User-Id é obrigatório.');
    error.code = 'USER_REQUIRED';
    error.status = 400;
    return next(error);
  }
  request.userId = userId.trim();
  next();
});

app.use(createDocumentRoutes({
  documentController,
  storageDirectory: config.storageDirectory,
  maxFileSizeBytes: config.maxFileSizeBytes
}));

app.use((error, request, response, next) => {
  if (response.headersSent) return next(error);
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return response.status(413).json({ error: { code: 'FILE_TOO_LARGE', message: 'O arquivo excede o limite permitido.' } });
  }
  if (error instanceof multer.MulterError) {
    return response.status(400).json({ error: { code: 'INVALID_MULTIPART', message: 'O formato do upload é inválido.' } });
  }
  const status = error.status || 500;
  const code = error.code || 'INTERNAL_ERROR';
  const message = status === 500 ? 'Ocorreu um erro interno.' : error.message;
  response.status(status).json({ error: { code, message } });
});

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`DMS backend ouvindo na porta ${config.port}`);
  });
}

module.exports = app;
