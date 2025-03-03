const express = require('express');
const path = require('path');
const dbOperations = require('./db');

const app = express();
const port = process.env.PORT || 3005;

app.use(express.json());
app.use(express.static('.'));

// Habilita CORS e iframes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('X-Frame-Options', 'ALLOWALL');
  next();
});

// API endpoints para magias
app.get('/api/spells', async (req, res) => {
  try {
    const spells = await dbOperations.loadSpells();
    res.json(spells);
  } catch (err) {
    console.error('Erro ao carregar magias:', err);
    res.status(500).json({ error: 'Erro ao carregar magias' });
  }
});

app.post('/api/spells', async (req, res) => {
  try {
    const spell = req.body;
    await dbOperations.saveSpell(spell);
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao salvar magia:', err);
    res.status(500).json({ error: 'Erro ao salvar magia' });
  }
});

app.put('/api/spells/:id', async (req, res) => {
  try {
    const spell = req.body;
    await dbOperations.updateSpell(spell);
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao atualizar magia:', err);
    res.status(500).json({ error: 'Erro ao atualizar magia' });
  }
});

app.delete('/api/spells/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await dbOperations.deleteSpell(id);
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao excluir magia:', err);
    res.status(500).json({ error: 'Erro ao excluir magia' });
  }
});

// NOVOS ENDPOINTS: API para anotações
app.get('/api/anotacoes', async (req, res) => {
  try {
    const anotacoes = await dbOperations.loadAnnotations();
    res.json(anotacoes);
  } catch (err) {
    console.error('Erro ao carregar anotações:', err);
    res.status(500).json({ error: 'Erro ao carregar anotações' });
  }
});

app.post('/api/anotacoes', async (req, res) => {
  try {
    const anotacao = req.body;
    await dbOperations.saveAnnotation(anotacao);
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao salvar anotação:', err);
    res.status(500).json({ error: 'Erro ao salvar anotação' });
  }
});

app.put('/api/anotacoes/:id', async (req, res) => {
  try {
    const anotacao = req.body;
    await dbOperations.saveAnnotation(anotacao);
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao atualizar anotação:', err);
    res.status(500).json({ error: 'Erro ao atualizar anotação' });
  }
});

app.delete('/api/anotacoes/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await dbOperations.deleteAnnotation(id);
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao excluir anotação:', err);
    res.status(500).json({ error: 'Erro ao excluir anotação' });
  }
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`A porta ${port} já está em uso. Tente uma das seguintes soluções:`);
    console.error('1. Feche o processo que está usando a porta (você pode usar "lsof -i :' + port + '" para encontrar o processo)');
    console.error('2. Use uma porta diferente definindo a variável de ambiente PORT:');
    console.error('   PORT=3000 node server.js');
  } else {
    console.error('Erro ao iniciar o servidor:', err);
  }
  process.exit(1);
});
