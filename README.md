# 💰 App de Gestão Financeira - FIAP

Aplicativo móvel de controle financeiro desenvolvido em React Native (Expo) para o Módulo 4 da Pós-graduação da FIAP. O app permite o registro de receitas e despesas, visualização de saldo, gráficos com análises mensais e upload de recibos.

## 🚀 Funcionalidades

- **Autenticação:** Login e Cadastro seguros utilizando Firebase Auth.
- **Dashboard Interativo:** Visão geral do saldo, total de receitas e despesas.
- **Gráficos Dinâmicos:** 
  - Gráfico de pizza (Receitas/Despesas por categoria).
  - Gráfico de barras (Comparativo mensal de receitas x despesas configurável entre 3, 6 e 12 meses).
- **Gestão de Transações:** Criação, edição e exclusão de transações.
- **Upload de Recibos:** Anexo de arquivos de imagens ou PDFs nas transações (Firebase Storage).
- **Filtros Avançados:** Busca por nome, filtro por tipo (receita/despesa), por categoria e intervalo de datas personalizadas.
- **Modo Dark/Light:** Interface que se adequa ao tema com alternância manual intuitiva.
- **Modo Privacidade:** Botão (ícone de olho) para ocultar dados sensíveis, como o salto atual, o montante da transação e seus títulos, com um clique.

## 🛠 Tecnologias Utilizadas

- **[React Native](https://reactnative.dev/)** + **[Expo](https://expo.dev/)** (com Expo Router)
- **[TypeScript](https://www.typescriptlang.org/)**
- **Estilização:** NativeWind / Tailwind CSS
- **Ícones:** Lucide React Native
- **Formulários:** React Hook Form + Zod (Validação de schemas)
- **Gráficos:** React Native Gifted Charts
- **Backend as a Service (BaaS):** Firebase (Auth, Firestore Database, Storage)
- **Gerenciador de Pacotes:** pnpm

## ⚙️ Pré-requisitos

Antes de rodar o projeto, você precisa ter instalado na sua máquina:
- [Node.js](https://nodejs.org/en/) (versão LTS recomendada)
- [pnpm](https://pnpm.io/pt/) (`npm install -g pnpm`)
- O aplicativo **Expo Go** instalado no seu celular (iOS ou Android), ou um emulador configurado e pronto para uso no computador.

## 🔐 Configuração do Firebase & Variáveis de Ambiente

O projeto depende de um projeto e chaves do Firebase para funcionar corretamente. Mantenha estas chaves ocultas em um arquivo de variáveis de ambiente.

1. Crie um projeto gratuitamente no [Firebase Console](https://console.firebase.google.com/).
2. Habilite o **Authentication** (Método de E-mail e Senha).
3. Habilite um banco de dados **Firestore** e inicie em "Modo de Teste" inicialmente, ou ajuste suas regras.
4. Habilite o **Storage** em "Modo de Teste" para permitir o upload da foto dos recibos.
5. Nas configurações do projeto (Project Settings), adicione ou registre um novo aplicativo "Web" para obter o bloco de chaves de API.

Crie um arquivo `.env` na pasta raiz do projeto clonado e preencha com as suas chaves correspondentes:

```env
EXPO_PUBLIC_FIREBASE_API_KEY="SUA_API_KEY"
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="SEU_AUTH_DOMAIN"
EXPO_PUBLIC_FIREBASE_PROJECT_ID="SEU_PROJECT_ID"
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="SEU_STORAGE_BUCKET"
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="SEU_SENDER_ID"
EXPO_PUBLIC_FIREBASE_APP_ID="SEU_APP_ID"
```

## 🏃 Como Rodar o Projeto

1. **Clone o repositório** do projeto:
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd Mobile
   ```

2. **Instale as dependências** do app usando o `pnpm`:
   ```bash
   pnpm install
   ```

3. **Inicie o servidor de desenvolvimento** do Expo:
   ```bash
   pnpm start
   ```

4. **Acesse o App na prática**:
   - Abra o app **Expo Go** no seu celular físico e escaneie o QR Code que aparecerá no terminal, ou...
   - Pressione `a` no terminal para abrir no Emulador Android (caso o Android Studio esteja em execução), ou...
   - Pressione `i` no terminal para abrir no Simulador iOS (caso o Xcode esteja instalado, disponível apenas para Mac).

## 📁 Estrutura Explicada do Projeto

Abaixo a visão em árvore de como o projeto está padronizado:

```text
/
├── app/                  # Rotas gerenciadas pelo Expo Router (Fluxo nativo e Telas)
│   ├── (auth)/           # Grupo de arquivos das telas de Login e Registro 
│   ├── (tabs)/           # Grupo das abas inferiores (Dashboard principal, Histórico e Telas logadas)
│   └── _layout.tsx       # Root Layout que engloba contextos do App
├── assets/               # Imagens e materiais estáticos
├── src/                  # Arquitetura e Lógica Principal (Código-fonte)
│   ├── components/       # Componentes genéricos de UI para reuso (Inputs, Empty States)
│   ├── contexts/         # Provider de Contextos da aplicação (AuthContext, TransactionContext)
│   ├── hooks/            # Hooks customizados que desincham componentes (ex: useUploadReceipt)
│   ├── lib/              # Inicializadores isolados (instância do firebase e APIs)
│   └── utils/            # Funções helpers padronizadas, categorizações e dicionários (Formatadores etc)
├── .env                  # Variáveis do SDK do Google/Firebase (ignorado do commit - gitignore)
├── tailwind.config.js    # Ponto de personalização do motor de CSS (NativeWind) do Figma para o Código
└── package.json          # Listagem dos pacotes e módulos do Node
```

## 📝 Scripts do Package.json

* `pnpm start`: Inicia o bundler Metro do Expo para os dispositivos conectarem.
* `pnpm android`: Inicia e força a abertura no emulador Android de forma nativa.
* `pnpm ios`: Inicia o app diretamente no simulador do ecossistema macOS.
* `pnpm reset-project`: Um script embutido no Expo para formatar a branch main com o starter, porém em nossa via atual, não será necessário.

---
*Este aplicativo foi desenvolvido para fins educacionais e avaliativos para a Pós Graduação Mobile FIAP Modulo 4. A responsabilidade financeira sobre o código e armazenamento de chaves nas APIs é sob a conta gratuita dos usuários desenvolvedores.*
