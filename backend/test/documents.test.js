const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const storageDirectory = path.join(os.tmpdir(), `dms-test-${process.pid}-${Date.now()}`);
process.env.STORAGE_DIR = storageDirectory;
process.env.MAX_FILE_SIZE_BYTES = '10';

const app = require('../src/app');
const { DocumentService } = require('../src/services/documentService');

let server;

before(async () => {
  await fs.mkdir(storageDirectory, { recursive: true });
  server = app.listen(0);
});

after(async () => {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  await fs.rm(storageDirectory, { recursive: true, force: true });
});

function url(route) {
  return `http://127.0.0.1:${server.address().port}${route}`;
}

function upload(fileName, content, userId = 'user-1') {
  const form = new FormData();
  form.append('file', new Blob([content], { type: 'text/plain' }), fileName);
  return fetch(url('/upload'), {
    method: 'POST',
    headers: { 'X-User-Id': userId },
    body: form
  });
}

test('exige usuário e arquivo e retorna erros JSON padronizados', async () => {
  const missingUser = await fetch(url('/documents'));
  assert.equal(missingUser.status, 400);
  assert.deepEqual(await missingUser.json(), {
    error: { code: 'USER_REQUIRED', message: 'O cabeçalho X-User-Id é obrigatório.' }
  });

  const missingFile = await fetch(url('/upload'), {
    method: 'POST',
    headers: { 'X-User-Id': 'user-1' }
  });
  assert.equal(missingFile.status, 400);
  assert.equal((await missingFile.json()).error.code, 'FILE_REQUIRED');

  const invalidField = new FormData();
  invalidField.append('wrong-field', new Blob(['x'], { type: 'text/plain' }), 'wrong.txt');
  const invalidMultipart = await fetch(url('/upload'), {
    method: 'POST',
    headers: { 'X-User-Id': 'user-1' },
    body: invalidField
  });
  assert.equal(invalidMultipart.status, 400);
  assert.equal((await invalidMultipart.json()).error.code, 'INVALID_MULTIPART');
});

test('faz upload, lista somente do owner e baixa com nome original', async () => {
  const uploadResponse = await upload('relatorio.txt', 'hello', 'user-1');
  assert.equal(uploadResponse.status, 201);
  const document = await uploadResponse.json();
  assert.equal(document.originalName, 'relatorio.txt');
  assert.equal(document.owner, 'user-1');
  assert.equal(document.size, 5);
  assert.equal('storedName' in document, false);

  const ownList = await fetch(url('/documents'), { headers: { 'X-User-Id': 'user-1' } });
  assert.deepEqual((await ownList.json()).documents.map(item => item.id), [document.id]);
  const otherList = await fetch(url('/documents'), { headers: { 'X-User-Id': 'user-2' } });
  assert.deepEqual((await otherList.json()).documents, []);

  const forbidden = await fetch(url(`/documents/${document.id}/download`), { headers: { 'X-User-Id': 'user-2' } });
  assert.equal(forbidden.status, 403);
  assert.equal((await forbidden.json()).error.code, 'DOCUMENT_FORBIDDEN');

  const download = await fetch(url(`/documents/${document.id}/download`), { headers: { 'X-User-Id': 'user-1' } });
  assert.equal(download.status, 200);
  assert.equal(await download.text(), 'hello');
  assert.match(download.headers.get('content-disposition'), /attachment; filename="relatorio\.txt"/);
});

test('aplica limite configurável e rejeita documento inexistente', async () => {
  const tooLarge = await upload('large.txt', '12345678901');
  assert.equal(tooLarge.status, 413);
  assert.equal((await tooLarge.json()).error.code, 'FILE_TOO_LARGE');

  const missing = await fetch(url('/documents/unknown/download'), { headers: { 'X-User-Id': 'user-1' } });
  assert.equal(missing.status, 404);
  assert.equal((await missing.json()).error.code, 'DOCUMENT_NOT_FOUND');
});

test('remove o arquivo quando o repositório de metadados falha', async () => {
  let removed = false;
  const service = new DocumentService({
    metadataRepository: { create: async () => { throw new Error('metadata failure'); } },
    fileRepository: {
      save: async () => ({ filename: 'safe.txt', size: 1, mimetype: 'text/plain' }),
      remove: async () => { removed = true; }
    }
  });

  await assert.rejects(() => service.upload({ filename: 'safe.txt', size: 1, mimetype: 'text/plain' }, 'user-1'));
  assert.equal(removed, true);
});