
Gerenciador de Magias e Anotações para Tormenta 20

Esse projeto foi criado pra facilitar a vida de quem joga Tormenta 20 — seja como mestre ou jogador.  
Ele ajuda a manter a mesa organizada, calcular magias com agilidade, registrar anotações e consultar fichas, tudo num só lugar e direto do navegador.

---

Funcionalidades

✔ Calculadora de Magias – Cálculo automático do custo, incluindo aprimoramentos  
✔ Gerenciamento de PM – Controle de mana e resistência mágica  
✔ Sistema de Anotações – Registre e organize tudo da campanha  
✔ Ficha de Personagem – Exibição direta em PDF, sem precisar alternar aba  
✔ Interface pensada pra RPGs de fantasia

---

Tecnologias Utilizadas

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js com Express.js
- Banco de Dados: SQLite3

---

Estrutura do Projeto

projeto/
├── index.html        # Página principal com a calculadora de magias
├── ficha.html        # Visualização de ficha em PDF
├── anotacoes.html    # Gerenciador de anotações
├── styles.css        # Estilo da interface
├── script.js         # Lógica das magias
├── anotacoes.js      # Lógica das anotações
├── db.js             # Configuração do SQLite
├── server.js         # Servidor Express
└── data/magias.db    # Banco com magias e anotações

---

Como Funciona

1. Calculadora de Magias  
   Crie magias e veja o custo na hora. O sistema calcula PMs e resistência automaticamente.

2. Anotações Integradas  
   Guarde resumos de sessão, estratégias e ideias — tudo salvo direto no navegador.

3. Ficha de Personagem  
   Consulta rápida da ficha em PDF, direto no navegador, sem atrapalhar o fluxo da sessão.

---

Como Rodar

Pré-requisitos:
- Node.js
- SQLite3

Instale as dependências:

npm install express sqlite3 path fs

Rode o servidor:

node server.js

Depois é só acessar: http://localhost:3005

---

Por que usar?

Durante a campanha, tempo é precioso. Esse projeto ajuda a deixar a mesa mais leve, organizada e sem planilha aberta do lado.  
A ideia é automatizar o que trava e deixar a história fluir.

---

Licença

MIT — veja o arquivo LICENSE

---

Contato

LinkedIn: https://www.linkedin.com/in/jefferson-hoy-valente/  
GitHub: https://github.com/jeffersonvalente
