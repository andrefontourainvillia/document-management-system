# Especificação: Document Management System

## 1. Objetivo

Entregar uma aplicação web que permita a usuários identificados enviar, consultar e baixar documentos armazenados exclusivamente no filesystem local da aplicação.

## 2. Escopo

### Dentro do escopo

- Upload de um documento por requisição.
- Armazenamento do arquivo em `backend/storage`.
- Listagem dos documentos disponíveis para o usuário.
- Download de um documento pelo identificador.
- Identificação simples do usuário por requisição.
- Exibição dos documentos em uma interface React.
- Tratamento de erros de validação, arquivo inexistente e falhas de armazenamento.
- Metadados mantidos em memória durante a execução do processo backend.
- Testes automatizados dos principais fluxos da API.

### Fora do escopo

- Autenticação, autorização ou gerenciamento de contas.
- Armazenamento externo, cloud storage ou banco de dados.
- Versionamento de documentos.
- Compartilhamento entre usuários.
- Pastas, tags ou busca avançada.
- Edição ou visualização do conteúdo no navegador.
- Exclusão de documentos.
- Upload múltiplo em uma única requisição.
- Persistência dos metadados após reinicialização do processo.
- Processamento, conversão ou antivírus dos arquivos.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O sistema deve aceitar o upload de um único documento usando `multipart/form-data`. |
| RF-02 | O campo do arquivo no formulário deve se chamar `file`. |
| RF-03 | O sistema deve rejeitar requisições sem arquivo. |
| RF-04 | O sistema deve gerar um identificador único para cada documento. |
| RF-05 | O sistema deve preservar o nome original do arquivo apenas nos metadados, sem utilizá-lo diretamente como caminho físico. |
| RF-06 | O sistema deve gravar o arquivo em `backend/storage` usando `multer` com `diskStorage`. |
| RF-07 | O sistema deve associar o documento ao usuário informado na requisição. |
| RF-08 | O sistema deve retornar os metadados do documento criado após um upload bem-sucedido. |
| RF-09 | O usuário deve poder listar os documentos associados a ele. |
| RF-10 | A listagem deve retornar os documentos ordenados do mais recente para o mais antigo. |
| RF-11 | O usuário deve poder baixar um documento pelo seu identificador. |
| RF-12 | O download deve retornar o conteúdo binário do arquivo original. |
| RF-13 | O download deve utilizar o nome original do arquivo no cabeçalho `Content-Disposition`. |
| RF-14 | O sistema deve retornar erro quando o identificador informado não existir. |
| RF-15 | O sistema deve impedir que um usuário baixe documento pertencente a outro usuário. |
| RF-16 | O frontend deve permitir selecionar um arquivo e iniciar o upload. |
| RF-17 | O frontend deve exibir o resultado do upload ou uma mensagem de erro. |
| RF-18 | O frontend deve carregar e exibir a lista de documentos do usuário atual. |
| RF-19 | O frontend deve disponibilizar uma ação de download para cada documento listado. |
| RF-20 | O backend deve manter o endpoint `GET /health`, retornando o estado da aplicação. |

### Identificação do usuário

Como não haverá autenticação nesta fase, o usuário será identificado pelo cabeçalho:

```http
X-User-Id: user-123
```

Regras:

- O valor deve ser uma string não vazia.
- O backend deve rejeitar requisições sem esse cabeçalho com `400 Bad Request`.
- O frontend deve usar um identificador configurado localmente, inicialmente `demo-user`.
- A identificação por cabeçalho é apenas uma convenção de desenvolvimento e não representa autenticação segura.

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | O backend deve usar Node.js, Express e CommonJS. |
| RNF-02 | O frontend deve usar React, Vite e módulos ESM. |
| RNF-03 | A comunicação do frontend deve utilizar `fetch` com o prefixo `/api`. |
| RNF-04 | O proxy do Vite deve encaminhar `/api` para o backend local. |
| RNF-05 | Os arquivos devem ser gravados exclusivamente no filesystem local. |
| RNF-06 | O upload deve utilizar `multer.diskStorage`. |
| RNF-07 | O diretório de armazenamento deve ser criado ou validado antes do uso. |
| RNF-08 | Os metadados devem permanecer em memória nesta fase. |
| RNF-09 | A configuração deve ser obtida por variáveis de ambiente sempre que aplicável. |
| RNF-10 | O backend não deve expor caminhos físicos internos nos retornos da API. |
| RNF-11 | O nome original não deve ser usado diretamente para evitar traversal ou colisões de nomes. |
| RNF-12 | Os erros devem ser retornados em formato JSON consistente. |
| RNF-13 | As camadas devem respeitar o fluxo `routes -> controllers -> services -> repositories`. |
| RNF-14 | As funções devem ter responsabilidade única e dependências explícitas. |
| RNF-15 | Os testes backend devem usar o runner nativo `node:test`. |
| RNF-16 | O sistema deve funcionar com Node.js compatível com os manifests existentes. |

### Configuração

Variáveis previstas:

| Variável | Obrigatória | Padrão | Descrição |
| --- | --- | --- | --- |
| `PORT` | Não | `3000` | Porta do backend. |
| `STORAGE_DIR` | Não | `backend/storage` | Diretório local dos arquivos. |
| `MAX_FILE_SIZE_BYTES` | Não | `10485760` | Limite de 10 MiB por arquivo. |
| `DEFAULT_USER_ID` | Não | `demo-user` | Identificador usado pelo frontend em desenvolvimento. |

O limite de arquivo deve ser aplicado pelo `multer`. O limite pode ser alterado sem modificar o código.

## 5. Modelo de dados

### Metadados do documento

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `id` | string | Sim | Identificador único e opaco do documento. |
| `originalName` | string | Sim | Nome original enviado pelo usuário. |
| `storedName` | string | Sim, interno | Nome seguro usado no filesystem. Não deve ser exposto pela API. |
| `size` | number | Sim | Tamanho do arquivo em bytes. |
| `mimeType` | string | Sim | Tipo MIME informado pelo upload. |
| `uploadedAt` | string | Sim | Data e hora do upload em ISO 8601 UTC. |
| `owner` | string | Sim | Identificador do usuário proprietário. |

Exemplo interno:

```json
{
  "id": "8e2b7e8e-5b8e-4c6e-a4ef-0f2ad1df3a20",
  "originalName": "relatorio.pdf",
  "storedName": "8e2b7e8e-5b8e-4c6e-a4ef-0f2ad1df3a20.pdf",
  "size": 245760,
  "mimeType": "application/pdf",
  "uploadedAt": "2026-08-19T14:30:00.000Z",
  "owner": "user-123"
}
```

### Representação pública

O campo `storedName` nunca deve ser retornado:

```json
{
  "id": "8e2b7e8e-5b8e-4c6e-a4ef-0f2ad1df3a20",
  "originalName": "relatorio.pdf",
  "size": 245760,
  "mimeType": "application/pdf",
  "uploadedAt": "2026-08-19T14:30:00.000Z",
  "owner": "user-123"
}
```

### Repositórios

O repositório de metadados deve oferecer, no mínimo:

```text
create(metadata)
findById(id)
findByOwner(owner)
```

O repositório de arquivos deve oferecer:

```text
save(uploadedFile)
getPath(storedName)
exists(storedName)
```

O serviço de documentos coordena os dois repositórios e garante que os metadados só sejam publicados quando o arquivo tiver sido gravado corretamente.

## 6. Contratos de API

Todas as rotas abaixo são expostas diretamente pelo backend. No frontend, o proxy acrescenta o prefixo `/api`; portanto, o frontend chama `/api/upload`, `/api/documents` e `/api/documents/:id/download`.

### Resposta de erro padrão

```json
{
  "error": {
    "code": "FILE_REQUIRED",
    "message": "É necessário enviar um arquivo."
  }
}
```

Códigos previstos:

| Código | HTTP | Uso |
| --- | ---: | --- |
| `USER_REQUIRED` | 400 | Cabeçalho `X-User-Id` ausente ou vazio. |
| `FILE_REQUIRED` | 400 | Nenhum arquivo foi enviado. |
| `FILE_TOO_LARGE` | 413 | Arquivo excede o limite configurado. |
| `INVALID_MULTIPART` | 400 | Formato de upload inválido. |
| `DOCUMENT_NOT_FOUND` | 404 | Documento inexistente. |
| `DOCUMENT_FORBIDDEN` | 403 | Documento pertence a outro usuário. |
| `STORAGE_ERROR` | 500 | Falha ao gravar ou acessar o filesystem. |
| `INTERNAL_ERROR` | 500 | Erro inesperado. |

### `POST /upload`

Envia um documento.

Headers:

```http
Content-Type: multipart/form-data
X-User-Id: user-123
```

Campo multipart:

```text
file: <arquivo>
```

Resposta de sucesso: `201 Created`

```json
{
  "id": "8e2b7e8e-5b8e-4c6e-a4ef-0f2ad1df3a20",
  "originalName": "relatorio.pdf",
  "size": 245760,
  "mimeType": "application/pdf",
  "uploadedAt": "2026-08-19T14:30:00.000Z",
  "owner": "user-123"
}
```

Respostas de erro:

- `400` se faltar o usuário ou arquivo.
- `413` se o arquivo exceder o limite.
- `500` se o arquivo não puder ser persistido.

### `GET /documents`

Lista os documentos do usuário.

Headers:

```http
X-User-Id: user-123
```

Resposta de sucesso: `200 OK`

```json
{
  "documents": [
    {
      "id": "8e2b7e8e-5b8e-4c6e-a4ef-0f2ad1df3a20",
      "originalName": "relatorio.pdf",
      "size": 245760,
      "mimeType": "application/pdf",
      "uploadedAt": "2026-08-19T14:30:00.000Z",
      "owner": "user-123"
    }
  ]
}
```

Quando não houver documentos:

```json
{
  "documents": []
}
```

Respostas de erro:

- `400` se faltar o usuário.
- `500` em caso de falha inesperada.

### `GET /documents/:id/download`

Baixa um documento do usuário atual.

Headers:

```http
X-User-Id: user-123
```

Resposta de sucesso: `200 OK`

Headers esperados:

```http
Content-Type: <mimeType do documento>
Content-Disposition: attachment; filename="relatorio.pdf"
```

Body:

- Conteúdo binário do arquivo armazenado.

Respostas de erro:

- `400` se faltar o usuário.
- `403` se o documento pertencer a outro usuário.
- `404` se o documento não existir ou o arquivo não estiver disponível.
- `500` em caso de falha de leitura.

### `GET /health`

Resposta de sucesso: `200 OK`

```json
{
  "status": "ok"
}
```

## 7. Arquitetura

### Backend

O fluxo deve seguir:

```text
routes -> controllers -> services -> repositories
```

Responsabilidades:

- `routes/`: registra endpoints, middleware do `multer` e encaminha requisições.
- `controllers/`: extrai headers, parâmetros e arquivo; valida entrada básica; traduz resultados para HTTP.
- `services/`: aplica regras de negócio, ownership, criação de identificadores e coordenação das persistências.
- `repositories/`: encapsula metadados em memória e acesso aos arquivos locais.
- `app.js`: configura Express, middleware global, rotas e tratamento de erros.

Arquivos previstos:

- `backend/src/app.js`
- `backend/src/routes/documentRoutes.js`
- `backend/src/controllers/documentController.js`
- `backend/src/services/documentService.js`
- `backend/src/repositories/documentMetadataRepository.js`
- `backend/src/repositories/localFileRepository.js`
- `backend/src/config.js` ou configuração equivalente, caso necessário
- `backend/test/app.test.js`
- `backend/test/documents.test.js`

O nome físico do arquivo deve ser gerado pelo sistema, preferencialmente a partir do `id` e de uma extensão sanitizada. O caminho final deve ser resolvido dentro de `STORAGE_DIR`.

### Frontend

Arquivos previstos:

- `frontend/src/App.jsx`
- `frontend/src/pages/DocumentsPage.jsx`
- `frontend/src/components/UploadComponent.jsx`
- `frontend/src/components/DocumentList.jsx`
- `frontend/src/components/DownloadButton.jsx`
- `frontend/src/services/documentService.js`

O serviço frontend deve encapsular:

```text
uploadDocument(file, userId)
listDocuments(userId)
getDownloadUrl(documentId)
```

As chamadas devem utilizar `fetch` e o prefixo `/api`, aproveitando o proxy já existente em `frontend/vite.config.js`.

## 8. Plano de execução

### Etapa 1: Configuração e contratos internos

Arquivos:

- Alterar `backend/src/app.js`.
- Criar módulo de configuração, se necessário.
- Criar ou atualizar testes básicos.

Atividades:

- Definir leitura de `PORT`, `STORAGE_DIR` e limite de arquivo.
- Garantir que o diretório local exista.
- Preservar `GET /health`.
- Definir o formato comum de erros.

Critérios de aceite:

- O backend inicia com `npm start`.
- `GET /health` responde `200`.
- O diretório configurado para armazenamento é validado ou criado.
- O processo não depende de serviços externos.

### Etapa 2: Persistência local e metadados

Arquivos:

- Criar `backend/src/repositories/documentMetadataRepository.js`.
- Criar `backend/src/repositories/localFileRepository.js`.
- Criar testes unitários ou de integração dos repositórios.

Atividades:

- Implementar coleção de metadados em memória.
- Implementar gravação usando filesystem local.
- Implementar resolução segura de caminhos.
- Implementar busca por ID e proprietário.

Critérios de aceite:

- Arquivos são gravados em `backend/storage` ou `STORAGE_DIR`.
- Os metadados não expõem `storedName`.
- A busca por proprietário não retorna documentos de outros usuários.
- O processo não aceita caminhos físicos fornecidos pelo cliente.

### Etapa 3: Regras de negócio

Arquivos:

- Criar `backend/src/services/documentService.js`.
- Criar testes do serviço.

Atividades:

- Implementar upload.
- Gerar ID e timestamp.
- Criar metadados somente após o arquivo ser salvo.
- Implementar listagem ordenada.
- Validar ownership antes do download.
- Mapear documento inexistente e arquivo ausente.

Critérios de aceite:

- Um upload válido produz metadados completos.
- A listagem retorna apenas documentos do usuário.
- Um usuário não consegue baixar documento de outro usuário.
- Falhas de armazenamento não deixam metadados inconsistentes.

### Etapa 4: Rotas e controllers HTTP

Arquivos:

- Criar `backend/src/controllers/documentController.js`.
- Criar `backend/src/routes/documentRoutes.js`.
- Alterar `backend/src/app.js`.
- Atualizar `backend/test/app.test.js`.
- Criar `backend/test/documents.test.js`.

Atividades:

- Configurar `multer.diskStorage`.
- Aplicar limite de tamanho configurável.
- Registrar `POST /upload`.
- Registrar `GET /documents`.
- Registrar `GET /documents/:id/download`.
- Implementar middleware de erros.

Critérios de aceite:

- `POST /upload` aceita `multipart/form-data` com campo `file`.
- As respostas usam os status definidos no contrato.
- O download retorna conteúdo binário e `Content-Disposition`.
- Erros são JSON e não expõem stack trace ou caminhos internos.
- Os testes cobrem sucesso e falhas principais.

### Etapa 5: Serviço frontend e tela de documentos

Arquivos:

- Criar `frontend/src/services/documentService.js`.
- Criar `frontend/src/pages/DocumentsPage.jsx`.
- Criar `frontend/src/components/UploadComponent.jsx`.
- Criar `frontend/src/components/DocumentList.jsx`.
- Criar `frontend/src/components/DownloadButton.jsx`.
- Alterar `frontend/src/App.jsx`.

Atividades:

- Criar fluxo de seleção e envio de arquivo.
- Exibir estado de carregamento.
- Exibir sucesso e erro.
- Carregar documentos do usuário atual.
- Disponibilizar download por item.
- Formatar tamanho e data para leitura.

Critérios de aceite:

- A aplicação frontend inicia com `npm run dev`.
- O usuário consegue selecionar e enviar um arquivo.
- A lista é atualizada depois de um upload bem-sucedido.
- Cada documento possui uma ação de download.
- Estados vazios, carregamento e erro são apresentados corretamente.
- As requisições usam `/api`.

### Etapa 6: Integração e validação final

Arquivos:

- Atualizar testes existentes em `backend/test`.
- Atualizar documentação do projeto, se necessário.
- Opcionalmente criar uma especificação consolidada em `docs/specs/document-management-system.md`.

Atividades:

- Executar testes backend.
- Executar build frontend.
- Validar o fluxo completo com backend e frontend ativos.
- Verificar reinicialização: os arquivos permanecem no disco, mas os metadados em memória são reiniciados, conforme escopo.
- Verificar limites de arquivo e isolamento por usuário.

Critérios de aceite:

- `npm test` no backend passa.
- `npm run build` no frontend passa.
- Upload, listagem e download funcionam ponta a ponta.
- O arquivo baixado corresponde ao arquivo enviado.
- Documentos não são cruzados entre usuários.
- Nenhum provedor externo é utilizado.
- A especificação e os contratos implementados permanecem consistentes.

## 9. Riscos e decisões

- **Metadados em memória:** reiniciar o backend perde a associação entre IDs e arquivos já gravados. Isso é aceito nesta fase e deve ser documentado.
- **Arquivos órfãos:** uma falha após a gravação e antes da criação do metadado pode deixar um arquivo sem registro. O serviço deve tentar remover o arquivo quando a criação do metadado falhar.
- **Identificação sem autenticação:** `X-User-Id` permite simulação de usuários, mas não oferece segurança real. Autenticação deve ser uma evolução futura.
- **Nomes maliciosos:** o nome original deve ser tratado apenas como dado de apresentação. O nome físico deve ser gerado pelo sistema.
- **Limite de upload:** o limite deve ser configurável por ambiente e aplicado pelo `multer`, evitando que arquivos excessivos cheguem às regras de negócio.
- **Conflito de rotas:** o backend deve manter as rotas sem `/api`, pois o proxy do Vite já remove esse prefixo antes de encaminhar a requisição.
- **Download autorizado:** o controller não deve decidir ownership; essa regra pertence ao serviço, mantendo a separação entre HTTP e negócio.
