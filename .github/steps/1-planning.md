# Passo 1: Planejamento com Plan Mode

Antes de escrever código, você vai planejar. O Plan Mode do GitHub Copilot
gera um plano de implementação usando apenas ferramentas de leitura e análise,
sem alterar o código.

## Conceito: agente de planejamento

O Plan Mode coleta contexto do codebase e da especificação e devolve um plano
estruturado. Como ele não edita arquivos, é seguro para explorar abordagens
antes de implementar.

## Objetivo

Produzir uma especificação e um plano de execução para o Document Management
System em `docs/specs`.

## O que você vai fazer

1. Abra o chat do Copilot e selecione o agente customizado `planner` (disponível em `.github/agents/planner.agent.md`).
2. Use como base o modelo em [docs/specs/spec-template.md](docs/specs/spec-template.md).
3. Peça ao agente para gerar a especificação completa do DMS com o prompt abaixo :

> 💾 **Prompt sugerido**
```
Gere a especificação completa do Document Management System a partir do modelo
em docs/specs/spec-template.md. Inclua requisitos funcionais, modelo de dados,
contratos de API e um plano de execução em etapas. Respeite a Clean Architecture
simples e a restrição de armazenamento local com multer.
```
 4. Ao final, use o handoff **Salvar planejamento** clicando no botão para
salvar o planejamento para a execução como `docs/specs/dms-spec.md`

5. Faça commit e push **na branch `feature/dms`** (criada no setup):

```bash
git add docs/specs/dms-spec.md
git commit -m "docs: especificação e plano do DMS"
git push
```
A automação valida a presença do arquivo e libera o Passo 2.
