# Gerenciador de Magias e Anotações para Tormenta 20 🎲✨

Este projeto é uma **ferramenta para auxiliar mestres e jogadores** de RPG, especialmente quem joga **Tormenta 20**.  
Com ele, é possível **gerenciar magias, anotações e fichas de personagem**, tudo de forma simples e automatizada, direto no navegador.  

## 📌 Funcionalidades

✔ **Calculadora de Magias** – Cálculo automático do custo de magias, incluindo aprimoramentos  
✔ **Gerenciamento de PM (Pontos de Mana)** – Controle de mana disponível e resistência das magias  
✔ **Sistema de Anotações** – Criação, edição e organização de anotações diretamente no sistema  
✔ **Ficha de Personagem em PDF** – Exibição integrada para consulta rápida durante as sessões  
✔ **Interface otimizada para RPGs de fantasia**  

---

## 🚀 Tecnologias Utilizadas

Este projeto foi desenvolvido com tecnologias simples e eficientes, garantindo facilidade de uso e personalização:

- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js com Express.js  
- **Banco de Dados:** SQLite3 (para armazenamento de magias e anotações)  

---

## 📂 Estrutura do Projeto

```
📁 projeto
├── 📄 index.html          # Página principal com a calculadora de magias
├── 📄 ficha.html          # Exibição da ficha de personagem em PDF
├── 📄 anotacoes.html      # Gerenciamento de anotações
├── 📄 styles.css         # Estilos visuais do projeto
├── 📄 script.js          # Lógica para gerenciamento de magias
├── 📄 anotacoes.js       # Lógica para anotações e organização
├── 📄 db.js              # Configuração do banco de dados SQLite
├── 📄 server.js          # Servidor Node.js para API das magias e anotações
└── 📁 data
    └── magias.db         # Banco de dados SQLite contendo magias e anotações
```

---

## 🔍 Como Funciona?

### 🧙‍♂️ **1. Calculadora de Magias**
A página principal (**index.html**) permite criar e gerenciar magias, calculando automaticamente **o custo de cada magia e seus aprimoramentos**.  
O sistema também mantém um controle de **PMs disponíveis e resistência** para evitar erros durante a sessão.

### 📝 **2. Anotações Integradas**
A página de anotações (**anotacoes.html**) permite **registrar e organizar informações importantes** da campanha, como estratégias, resumos de sessões ou descrições de NPCs.  
Tudo fica salvo para acesso rápido, sem risco de perder informações importantes.

### 📜 **3. Ficha de Personagem em PDF**
A página **ficha.html** permite visualizar a **ficha do personagem em PDF diretamente no navegador**, facilitando a consulta rápida sem precisar alternar entre abas ou papéis.

---

## 🔧 Como Executar

### 1️⃣ Pré-requisitos

- Node.js instalado  
- SQLite3 instalado  

### 2️⃣ Instalar Dependências

```bash
npm install express sqlite3 path fs
```

### 3️⃣ Iniciar o Servidor

```bash
node server.js
```

O servidor será iniciado em **http://localhost:3005**.

---

## 💡 Por que usar essa ferramenta?

Se você já precisou parar uma sessão para recalcular mana ou perdeu anotações importantes no meio de uma campanha, sabe como a organização pode fazer a diferença.  
Esse sistema ajuda **a manter tudo acessível e automatizado**, permitindo que jogadores e mestres foquem no que realmente importa: **a história e a diversão**. 🎲✨  

Se quiser testar ou contribuir, o código está aberto no GitHub! 🚀  

---

## 📜 Licença

Este projeto é de código aberto e está licenciado sob a [MIT License](LICENSE).

---

🔹 **Desenvolvido por [Seu Nome]** 🔹