# Sprint 5: Aplicativo Móvel (React Native & UX de Captura)

**Objectivo**: Desenvolver a interface móvel em React Native para guiar o utilizador através do formulário de dados, captura obrigatória de selfie em tempo real, captura de fotos do BI (frente/verso), compressão de ficheiros e exibição de feedback visual do processamento.

---

## 📋 Lista de Tarefas (ToDo)

### 1. Configuração e Dependências do App (`apps/mobile`)
- [ ] Configurar as dependências do React Native em `apps/mobile/package.json` (bibliotecas de câmara, selecção de ficheiros, compressão de imagens e requisições HTTP).
- [ ] Adicionar e configurar `@kyc/shared` como dependência interna do workspace.
- [ ] Criar o cliente HTTP base em `apps/mobile/src/services/api.service.ts` para conectar ao host da API Backend.

### 2. Formulário de Dados Pessoais
- [ ] Criar o ecrã inicial de boas-vindas e introdução ao processo de KYC.
- [ ] Criar o ecrã do formulário contendo inputs para:
  - [ ] Nome completo.
  - [ ] Data de nascimento (com componente DatePicker).
  - [ ] Número do BI.
  - [ ] Número de Identificação Fiscal (NIF).
- [ ] Adicionar validação em tempo real utilizando o `KycSubmissionSchema` do `@kyc/shared`.

### 3. Componentes de Captura de Imagem (`CameraCapture.tsx` & `DocumentPicker.tsx`)
- [ ] Implementar o componente `DocumentPicker` para permitir selecção da galeria ou captura por câmara para os documentos (BI Frente e BI Verso).
- [ ] Implementar o componente `CameraCapture` utilizando a câmara nativa.
- [ ] Configurar o comportamento da **Selfie**:
  - [ ] Forçar a abertura da câmara frontal.
  - [ ] **Proibir terminantemente** o upload a partir da galeria de fotos (apenas captura em tempo real).
- [ ] Implementar a lógica de compressão de imagens pós-captura (garantir tamanho < 1MB por imagem e formato JPEG com 85% de qualidade).

### 4. Orquestração de Ecrãs e Navegação
- [ ] Implementar a navegação passo-a-passo:
  1. Formulário -> 2. Captura BI Frente -> 3. Captura BI Verso -> 4. Captura Selfie -> 5. Ecrã de Confirmação dos Dados.
- [ ] No ecrã de confirmação, exibir as fotos tiradas e os dados inseridos.

### 5. Ecrã de Loading, Envio e Resultados
- [ ] Implementar o ecrã de upload que envia os dados no formato `multipart/form-data` para a API.
- [ ] Exibir um loading animado com barra de progresso ou mensagem de espera explicativa (informando que o processamento pode demorar entre 20 a 40 segundos).
- [ ] Criar o ecrã final de resultado:
  - [ ] **Aprovado ✅**: Exibe feedback positivo.
  - [ ] **Reprovado ❌**: Trata as respostas 422 HTTP da API e exibe o motivo de falha em português amigável ao utilizador (ex: "A selfie não corresponde à foto do BI" em caso de `KYC_FACE_MISMATCH`).

---

## 🔍 Critérios de Aceitação
- [x] O utilizador consegue avançar nos ecrãs e preencher os dados de forma fluida.
- [x] Não é permitido submeter fotos da galeria para o campo Selfie.
- [x] As imagens enviadas para a API são comprimidas para menos de 1MB, garantindo uploads eficientes.
- [x] O app lida correctamente com tempos de espera longos (timeout superior a 40s) sem fechar abruptamente.
- [x] Mensagens de erro de validação (ex: NIF incorreto) são exibidas de forma clara na língua portuguesa.
