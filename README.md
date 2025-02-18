# Calculadora-Magias-Tormenta20

![Spell Calc](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow) ![License](https://img.shields.io/github/license/jeffersonvalente/spell-calc)

Calculadora de dano para feitiços em jogos de RPG, levando em consideração fatores como poder base, modificadores, resistências e buffs/debuffs.

## 🚀 Funcionalidades
- 🧙‍♂️ Cálculo preciso de dano mágico baseado em estatísticas do personagem.
- 🔢 Personalização de fórmulas para diferentes tipos de feitiços.
- 🛡️ Inclusão de resistências e buffs/debuffs dinâmicos.
- 📊 Interface simples para facilitar a entrada de dados.
- 📝 Cadastro de novas magias através da interface web.

## 📌 Tecnologias Utilizadas

Este projeto foi desenvolvido com as seguintes tecnologias:
- **Python** 🐍
- **Flask** (se houver API ou interface web)
- **Jupyter Notebook** (se houver estudos de cálculos documentados)
- **Pytest** (se houver testes unitários)
- **HTML/CSS/JavaScript** para a interface web

## 📦 Instalação

Para utilizar o projeto localmente, siga os passos abaixo:

```bash
# Clone o repositório
git clone https://github.com/jeffersonvalente/spell-calc.git
cd spell-calc

# Crie um ambiente virtual (opcional, mas recomendado)
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

# Instale as dependências
pip install -r requirements.txt
```

## 🚀 Como Usar

1. Execute o script principal:
   ```bash
   python spell_calc.py
   ```
2. Insira os parâmetros necessários para calcular o dano do feitiço.
3. O resultado do cálculo será exibido no terminal ou interface gráfica (se aplicável).

## 🌟 Interface Web

O projeto possui uma interface web que permite:
- Listar magias cadastradas.
- Visualizar detalhes de cada magia.
- Editar ou excluir magias existentes.
- **Cadastrar novas magias**, inserindo informações como nome, custo base, execução, alcance, alvo, duração, resistência e aprimoramentos disponíveis.

Para rodar a interface web, utilize o seguinte comando:
```bash
flask run
```
E acesse no navegador: `http://127.0.0.1:5000`

## ✅ Testes

Se houver testes automatizados, você pode rodá-los com:
```bash
pytest
```

## 📖 Exemplos de Uso

```python
from spell_calc import calcular_dano

dano = calcular_dano(poder=120, resistencia=30, buffs=["Amplify Magic"], debuffs=["Weaken"])
print(f"Dano causado: {dano}")
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:
1. Fork este repositório.
2. Crie uma nova branch: `git checkout -b minha-feature`
3. Faça suas alterações e commits.
4. Envie um Pull Request.

## 📜 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

📧 Entre em contato pelo [LinkedIn](https://www.linkedin.com/in/jefferson-hoy-valente/) ou abra uma issue no repositório.
