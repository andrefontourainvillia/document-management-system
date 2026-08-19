const multer = require('multer');
const crypto = require('node:crypto');
const path = require('node:path');

function createDocumentRoutes({ documentController, storageDirectory, maxFileSizeBytes }) {
  const storage = multer.diskStorage({
    destination: storageDirectory,
    filename: (request, file, callback) => {
      const extension = path.extname(file.originalname).replace(/[^a-zA-Z0-9.]/g, '').slice(0, 20);
      callback(null, `${crypto.randomUUID()}${extension}`);
    }
  });
  const upload = multer({ storage, limits: { fileSize: maxFileSizeBytes } });
  const router = require('express').Router();

  router.post('/upload', upload.single('file'), documentController.upload);
  router.get('/documents', documentController.list);
  router.get('/documents/:id/download', documentController.download);
  return router;
}

module.exports = { createDocumentRoutes };