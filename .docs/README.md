# Plano de Desenvolvimento do MVP - KYC Angola

Este directório contém a documentação detalhada para o desenvolvimento do MVP do sistema de **KYC (Know Your Customer) Angola**. O planeamento está estruturado em **6 Sprints**, divididos de forma incremental para garantir o fluxo de valor e a lógica de fail-fast definida no documento [AGENTS.md](file:///home/betalover/kyc/AGENTS.md).

---

## 📅 Resumo dos Sprints & Cronograma Sugerido

| Sprint | Foco Principal | Duração Estimada | Dependências |
|---|---|---|---|
| **[Sprint 1: Infraestrutura e Pacote Compartilhado](file:///home/betalover/kyc/.doc/sprint_1_infra.md)** | Configuração de Docker, base de dados, MinIO e tipos partilhados | 1 semana | Nenhuma |
| **[Sprint 2: Núcleo do Agente de IA (OCR, Autenticidade & Comparação Facial)](file:///home/betalover/kyc/.doc/sprint_2_agent_core.md)** | Desenvolvimento das ferramentas principais do agente LangChain | 2 semanas | Sprint 1 |
| **[Sprint 3: Integração Externa (Portal do Contribuinte via Firecrawl)](file:///home/betalover/kyc/.doc/sprint_3_portal_integration.md)** | Scraping do NIF e orquestração determinística do agente | 1 semana | Sprint 2 |
| **[Sprint 4: API Backend (NestJS & Orquestração)](file:///home/betalover/kyc/.doc/sprint_4_backend_api.md)** | Criação do servidor NestJS, endpoints REST, upload MinIO e execução do Agente | 2 semanas | Sprint 3 |
| **[Sprint 5: Aplicativo Móvel (React Native & UX)](file:///home/betalover/kyc/.doc/sprint_5_mobile_app.md)** | Captura de imagens local, formulários e integração com a API backend | 2 semanas | Sprint 4 |
| **[Sprint 6: Testes Integrados, Calibração e Ajustes](file:///home/betalover/kyc/.doc/sprint_6_testing_calibration.md)** | Testes de ponta-a-ponta, calibração do threshold facial e tratamento de erros | 1 semana | Sprint 5 |

---

## 🛠️ Como Utilizar os Ficheiros de Sprint

Cada sprint possui o seu próprio ficheiro Markdown com tarefas formatadas como ToDo (`[ ]`). 

Para acompanhar o progresso:
1. Abra o ficheiro do sprint correspondente.
2. Marque as tarefas como iniciadas utilizando `[/]` ou concluídas com `[x]`.
3. Adicione observações ou anotações específicas abaixo de cada tarefa conforme necessário.

### Acesso Rápido aos Sprints
* 📋 **[Sprint 1: Infraestrutura e Pacote Compartilhado](file:///home/betalover/kyc/.doc/sprint_1_infra.md)**
* 🤖 **[Sprint 2: Núcleo do Agente de IA (Visão, OCR e Bio)](file:///home/betalover/kyc/.doc/sprint_2_agent_core.md)**
* 🌐 **[Sprint 3: Integração Portal do Contribuinte](file:///home/betalover/kyc/.doc/sprint_3_portal_integration.md)**
* 🖥️ **[Sprint 4: API Backend NestJS](file:///home/betalover/kyc/.doc/sprint_4_backend_api.md)**
* 📱 **[Sprint 5: App React Native](file:///home/betalover/kyc/.doc/sprint_5_mobile_app.md)**
* 🧪 **[Sprint 6: Testes Integrados e Fecho](file:///home/betalover/kyc/.doc/sprint_6_testing_calibration.md)**

---

## 📌 Convenções de Desenvolvimento do MVP
- **Fail-Fast**: Interromper o processo no primeiro erro encontrado pelo agente.
- **Portabilidade**: Execução 100% baseada no Monorepo configurado com pnpm workspaces e turborepo.
- **Segurança**: Credenciais e URLs geridas exclusivamente por ficheiros `.env`.
