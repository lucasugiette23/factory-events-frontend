# Factory Events Monitor — Frontend Angular

Frontend em **Angular 19** e **TypeScript** para monitoramento e registro de eventos de equipamentos industriais, desenvolvido para integração com API REST Spring Boot (`http://localhost:8080/api/events`).

---

## 1. Tecnologias Utilizadas

- **Angular 19** (Standalone Components, modern control flow `@if` / `@for`)
- **TypeScript 5.7** (Strict Mode ativado, tipagem estrita de contratos)
- **Angular Reactive Forms** (validações síncronas e customizadas contra whitespace)
- **Angular HttpClient** (`provideHttpClient`, `withFetch`)
- **RxJS 7.8** (Observables tipados e operadores `takeUntilDestroyed`)
- **SCSS** (Design System com variáveis CSS, responsivo, sem bibliotecas externas pesadas)
- **Jasmine & Karma** (Bateria de testes unitários com `provideHttpClientTesting` e ChromeHeadless)

---

## 2. Requisitos para Execução

- **Node.js**: Ambiente de referência testado com Node v20.20.0.
- **NPM**: Ambiente de referência testado com NPM 10.8.2. O lockfile está incluído para instalação com `npm ci`.
- **Google Chrome** (ou navegador compatível para execução dos testes unitários em modo headless).

---

## 3. Como Instalar as Dependências

Na raiz do projeto (`factory-events-frontend`), execute:

```bash
npm ci
```

---

## 4. Como Iniciar o Frontend

Para iniciar o servidor de desenvolvimento:

```bash
npm start
```
*ou via Angular CLI:*
```bash
npx ng serve
```

A aplicação estará disponível em `http://localhost:4200/`. O servidor possui Live Reload ativado e recarrega automaticamente ao detectar alterações no código.

---

## 5. Como Configurar a URL do Backend

A URL base da API REST está centralizada nos arquivos de configuração de ambiente:

- **Produção**: [`src/environments/environment.ts`](src/environments/environment.ts)
- **Desenvolvimento**: [`src/environments/environment.development.ts`](src/environments/environment.development.ts)

Exemplo de configuração:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/events'
};
```

Para alterar o endpoint da API para apontar para outro host ou porta, basta modificar a propriedade `apiUrl`.

### Executar backend e frontend em conjunto

O backend está no [repositório factory-events-backend](https://github.com/lucasugiette23/factory-events-backend). Ele exige JDK 21 e inclui Maven Wrapper; o H2 inicia junto com a aplicação.

Em um terminal, na pasta do backend:

```bash
./mvnw spring-boot:run
```

No Windows (PowerShell), use `.\mvnw.cmd spring-boot:run`. Configure `JAVA_HOME` para o JDK 21. A API deve ficar disponível em `http://localhost:8080/api/events`.

Em outro terminal, na pasta deste frontend:

```bash
npm ci
npm start
```

Abra `http://localhost:4200/`. O backend permite essa origem por CORS. Ao alterar host ou porta do frontend, ajuste também o CORS no backend. O cadastro envia o `eventId` informado no formulário; não é necessário enviar um header de idempotência.

Para conferir a integração, cadastre um evento, verifique sua inclusão na tabela e tente cadastrar novamente o mesmo `eventId`: a API deve retornar 409 e a tela deve apresentar a mensagem de duplicidade.

### Contrato de Endpoints da API

- **`GET /api/events`**: Retorna array JSON contendo todos os eventos registrados.
- **`POST /api/events`**: Registra novo evento com payload:
  ```json
  {
    "eventId": "EVT-1001",
    "eventType": "PRODUCTION",
    "description": "Production line started",
    "timestamp": "2026-05-20T10:00:00"
  }
  ```
- **Tratamento de Códigos HTTP e ProblemDetail**:
  - `201`: Evento cadastrado com sucesso.
  - `400`: Dados inválidos enviados no formulário.
  - `409`: `DUPLICATE_EVENT` identifica duplicidade; `DATA_INTEGRITY_ERROR` identifica outros conflitos de integridade.
  - `503`: Falha de acesso ao banco (`DATABASE_ERROR`).
  - `500`: Erro interno no backend (`INTERNAL_ERROR`).
  - `Status 0`: Falha de conexão (*"Unable to connect to the server"*).

---

O frontend lê o `detail` dos códigos de erro conhecidos da API e, em `VALIDATION_ERROR`, acrescenta os campos e mensagens recebidos em `errors` ao alerta. Respostas sem estrutura reconhecida utilizam mensagens genéricas, sem exibir corpos brutos ou stack traces. Um 409 sem código conhecido é apresentado como conflito de dados, sem presumir duplicidade.

`eventId` e `description` são obrigatórios, rejeitam valores compostos apenas por espaços e têm limite de 255 caracteres, alinhado ao backend. O limite é aplicado no formulário reativo e nos campos HTML.

## 6. Como Executar os Testes

Para rodar todos os testes unitários uma única vez com o Chrome Headless:

```bash
npx ng test --watch=false --browsers=ChromeHeadless
```

Para rodar em modo contínuo de desenvolvimento com navegador interativo:

```bash
npm test
```

### Cobertura dos Testes Unitários

- **`EventService`**: Verifica requisições `GET` e `POST`, integridade do payload enviado e tratamento de erros com `HttpTestingController`.
- **`EventFormComponent`**: Testa inicialização dos campos, validações obrigatórias, limite de 255 caracteres, rejeição de strings compostas apenas por espaços em branco, emissão de dados normalizados e desativação do botão de submissão durante envio para prevenir chamadas concorrentes.
- **`EventListComponent`**: Testa renderização da tabela, apresentação dos badges (`PRODUCTION` vs `QUALITY` com tag de auditoria), estados de tela vazia (*empty state*), tela de carregamento (*loading*) e acionamento do botão de refresh.
- **`EventsPageComponent`**: Testa orquestração completa (carregamento ao inicializar, fluxo de criação com sucesso e reset do formulário, tratamento de duplicidade e outros conflitos HTTP 409, ProblemDetail e falhas de conexão).
- **`date.utils` & `noWhitespaceValidator`**: Testes focados na conversão e garantia estrita do formato ISO `YYYY-MM-DDTHH:mm:ss` e validação customizada de espaços.

---

Para gerar a versão de produção:

```bash
npm run build
```

Os arquivos são gerados em `dist/factory-events-frontend/browser/`. A compilação inclui o download da fonte do Google Fonts referenciada no HTML e requer acesso à rede para essa etapa. Os testes unitários usam mocks HTTP; a validação completa contra o backend real deve seguir o roteiro de integração acima.

## 7. Organização e Responsabilidades dos Componentes

A arquitetura do projeto segue o padrão modular recomendado pelo Angular, separando o domínio central (*core*) das funcionalidades de apresentação (*features*):

```text
src/
├── environments/
│   ├── environment.ts                   # Configuração de URL de produção
│   └── environment.development.ts       # Configuração de URL de desenvolvimento
└── app/
    ├── core/
    │   ├── models/
    │   │   ├── event-type.enum.ts       # Enum EventType ('PRODUCTION' | 'QUALITY')
    │   │   └── event.model.ts           # Interfaces FactoryEvent e CreateEventDto
    │   ├── services/
    │   │   ├── event.service.ts         # Chamadas HTTP REST (GET e POST tipados)
    │   │   └── event.service.spec.ts    # Testes unitários do serviço HTTP
    │   ├── utils/
    │   │   ├── date.utils.ts            # Utilitários de formatação de data para API
    │   │   └── date.utils.spec.ts       # Testes dos utilitários de data
    │   └── validators/
    │       ├── no-whitespace.validator.ts # Validador reativo contra espaços vazios
    │       └── no-whitespace.validator.spec.ts
    │
    ├── features/
    │   └── events/
    │       ├── components/
    │       │   ├── event-form/          # Formulário de cadastro reativo
    │       │   │   ├── event-form.component.ts
    │       │   │   ├── event-form.component.html
    │       │   │   ├── event-form.component.scss
    │       │   │   └── event-form.component.spec.ts
    │       │   └── event-list/          # Tabela com listagem, badges e estados
    │       │       ├── event-list.component.ts
    │       │       ├── event-list.component.html
    │       │       ├── event-list.component.scss
    │       │       └── event-list.component.spec.ts
    │       ├── events-page.component.ts # Orquestrador de estado e feedback
    │       ├── events-page.component.html
    │       ├── events-page.component.scss
    │       └── events-page.component.spec.ts
    │
    ├── app.component.ts                 # Shell da aplicação (navbar e container)
    ├── app.component.html
    ├── app.component.scss
    ├── app.component.spec.ts
    └── app.config.ts                    # Provedores globais (HttpClient, ChangeDetection)
```

### Divisão de Responsabilidades

1. **`EventService`**:
   - Camada exclusiva de comunicação HTTP.
   - Retorna Observables estritamente tipados (`FactoryEvent`, `FactoryEvent[]`).
   - Isento de qualquer lógica de apresentação ou manipulação de DOM.

2. **`EventFormComponent`**:
   - Constrói o `FormGroup` com Angular Reactive Forms.
   - Aplica validações requeridas e sanitização (trim) de `eventId` e `description`.
   - Inicializa `timestamp` com a data e hora local atual no formato `YYYY-MM-DDTHH:mm:ss`.
   - Emite dados válidos via `@Output() submitEvent` para o componente pai.
   - Não dispara requisições HTTP diretamente.

3. **`EventListComponent`**:
   - Componente de apresentação puro (*dumb component*).
   - Recebe `events`, `isLoading` e `errorMessage` através de `@Input()`.
   - Renderiza a tabela de eventos, badges de status (`PRODUCTION` vs `QUALITY`), formato legível de data e estados de feedback (carregamento, vazio ou erro).
   - Emite evento `@Output() refresh` para solicitar recarregamento.

4. **`EventsPageComponent`**:
   - Componente inteligente (*smart/container component*).
   - Orquestra o fluxo de dados entre o formulário, o serviço HTTP e a listagem.
   - Gerencia estados de submissão, banners de feedback (sucesso/erro), status HTTP da API (400, 409, 500, status 0).
   - Dispara a atualização automática da tabela após cadastro bem-sucedido e limpa o formulário mantendo a data atual.


## 8. Principais Decisões Técnicas

- Componentes standalone separados em formulário, listagem e página para isolar apresentação, estado e comunicação HTTP.
- Formulários reativos para validar os dados antes do envio e bloquear submissão enquanto há uma requisição em andamento.
- `eventId` externo informado pelo usuário; a prevenção definitiva de duplicidade é responsabilidade da API e da restrição única do banco.
- Timestamp local sem conversão para UTC para manter o contrato `LocalDateTime` do backend.
- `ProblemDetail` com códigos conhecidos para apresentar mensagens úteis e manter fallbacks para respostas inesperadas.
- O cabeçalho não apresenta um indicador estático de conexão; erros de comunicação são exibidos nas operações reais de consulta e cadastro.

## 9. Possíveis Melhorias Futuras

- Adicionar testes de ponta a ponta com o backend e banco reais.
- Associar os erros de validação retornados pela API diretamente a cada campo do formulário, além do alerta atual.
- Implementar paginação, filtros e ordenação quando esses recursos forem disponibilizados pelo backend.
- Padronizar o idioma das telas e mensagens, atualmente em inglês com detalhes da API em português.
- Adicionar monitoramento real de disponibilidade caso o produto precise de um indicador de conexão.
- Configurar a URL de produção e ampliar verificações de acessibilidade e responsividade.
