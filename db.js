const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Define o caminho do banco de dados para ser relativo ao diretório do projeto
const dbPath = path.join(__dirname, 'data', 'magias.db');

// Cria o diretório data se não existir
const fs = require('fs');
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

const db = new sqlite3.Database(dbPath);

// Inicializa o banco de dados
db.serialize(() => {
  // Tabela de magias
  db.run(`CREATE TABLE IF NOT EXISTS magias (
    id INTEGER PRIMARY KEY,
    nome TEXT NOT NULL,
    custo INTEGER NOT NULL,
    execucao TEXT NOT NULL,
    alcance TEXT NOT NULL,
    alvoArea TEXT NOT NULL,
    duracao TEXT NOT NULL,
    resistencia TEXT,
    descricao TEXT NOT NULL
  )`);

  // Tabela de aprimoramentos
  db.run(`CREATE TABLE IF NOT EXISTS aprimoramentos (
    id INTEGER PRIMARY KEY,
    magia_id INTEGER NOT NULL,
    pm INTEGER NOT NULL,
    descricao TEXT NOT NULL,
    aumenta BOOLEAN NOT NULL,
    count INTEGER DEFAULT 0,
    FOREIGN KEY (magia_id) REFERENCES magias (id)
  )`);

  // NOVO: Tabela de anotações
  db.run(`CREATE TABLE IF NOT EXISTS anotacoes (
    id INTEGER PRIMARY KEY,
    titulo TEXT NOT NULL,
    conteudo TEXT NOT NULL
  )`);
});

// Funções de CRUD
const dbOperations = {
  // Salvar uma nova magia
  saveSpell: (spell) => {
    return new Promise((resolve, reject) => {
      // Inicia uma transação
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        try {
          // Verifica se a magia já existe
          db.get('SELECT id FROM magias WHERE id = ?', [spell.id], (err, row) => {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
              return;
            }

            if (row) {
              // Se a magia já existe, atualiza em vez de inserir
              db.run(
                `UPDATE magias 
                 SET nome = ?, custo = ?, execucao = ?, alcance = ?, alvoArea = ?, 
                     duracao = ?, resistencia = ?, descricao = ?
                 WHERE id = ?`,
                [spell.nome, spell.custo, spell.execucao, spell.alcance, spell.alvoArea, 
                 spell.duracao, spell.resistencia, spell.descricao, spell.id]
              );
            } else {
              // Se a magia não existe, insere
              db.run(
                `INSERT INTO magias (id, nome, custo, execucao, alcance, alvoArea, duracao, resistencia, descricao)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [spell.id, spell.nome, spell.custo, spell.execucao, spell.alcance, spell.alvoArea, spell.duracao, spell.resistencia, spell.descricao]
              );
            }

            // Remove aprimoramentos antigos se existirem
            db.run('DELETE FROM aprimoramentos WHERE magia_id = ?', [spell.id]);

            // Salva os aprimoramentos
            const stmt = db.prepare('INSERT INTO aprimoramentos (magia_id, pm, descricao, aumenta, count) VALUES (?, ?, ?, ?, ?)');
            spell.aprimoramentos.forEach(apr => {
              stmt.run([spell.id, apr.pm, apr.descricao, apr.aumenta ? 1 : 0, apr.count || 0]);
            });
            stmt.finalize();

            // Confirma a transação
            db.run('COMMIT', (err) => {
              if (err) {
                db.run('ROLLBACK');
                reject(err);
              } else {
                resolve(spell.id);
              }
            });
          });
        } catch (err) {
          db.run('ROLLBACK');
          reject(err);
        }
      });
    });
  },

  // Atualizar uma magia existente
  updateSpell: (spell) => {
    return new Promise((resolve, reject) => {
      // Inicia uma transação
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        try {
          // Atualiza a magia
          db.run(
            `UPDATE magias 
             SET nome = ?, custo = ?, execucao = ?, alcance = ?, alvoArea = ?, 
                 duracao = ?, resistencia = ?, descricao = ?
             WHERE id = ?`,
            [spell.nome, spell.custo, spell.execucao, spell.alcance, spell.alvoArea, 
             spell.duracao, spell.resistencia, spell.descricao, spell.id]
          );

          // Remove aprimoramentos antigos
          db.run('DELETE FROM aprimoramentos WHERE magia_id = ?', [spell.id]);

          // Insere novos aprimoramentos
          const stmt = db.prepare('INSERT INTO aprimoramentos (magia_id, pm, descricao, aumenta, count) VALUES (?, ?, ?, ?, ?)');
          spell.aprimoramentos.forEach(apr => {
            stmt.run([spell.id, apr.pm, apr.descricao, apr.aumenta ? 1 : 0, apr.count || 0]);
          });
          stmt.finalize();

          // Confirma a transação
          db.run('COMMIT', (err) => {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
            } else {
              resolve();
            }
          });
        } catch (err) {
          db.run('ROLLBACK');
          reject(err);
        }
      });
    });
  },

  // Carregar todas as magias
  loadSpells: () => {
    return new Promise((resolve, reject) => {
      const spells = [];
      db.each(
        'SELECT * FROM magias',
        (err, spell) => {
          if (err) {
            reject(err);
            return;
          }
          spell.aprimoramentos = [];
          spells.push(spell);
        },
        (err) => {
          if (err) {
            reject(err);
            return;
          }

          // Carrega os aprimoramentos para cada magia
          const promises = spells.map(spell => {
            return new Promise((resolve, reject) => {
              db.all(
                'SELECT * FROM aprimoramentos WHERE magia_id = ?',
                [spell.id],
                (err, aprimoramentos) => {
                  if (err) {
                    reject(err);
                    return;
                  }
                  spell.aprimoramentos = aprimoramentos.map(apr => ({
                    ...apr,
                    aumenta: !!apr.aumenta
                  }));
                  resolve();
                }
              );
            });
          });

          Promise.all(promises).then(() => resolve(spells));
        }
      );
    });
  },

  // Deletar uma magia
  deleteSpell: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM aprimoramentos WHERE magia_id = ?', [id], (err) => {
        if (err) {
          reject(err);
          return;
        }
        db.run('DELETE FROM magias WHERE id = ?', [id], (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    });
  },

  // NOVO: Salvar ou atualizar uma anotação
  saveAnnotation: (annotation) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT id FROM anotacoes WHERE id = ?', [annotation.id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        if (row) {
          // Atualiza a anotação
          db.run(
            `UPDATE anotacoes SET titulo = ?, conteudo = ? WHERE id = ?`,
            [annotation.titulo, annotation.conteudo, annotation.id],
            (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(annotation.id);
              }
            }
          );
        } else {
          // Insere nova anotação
          db.run(
            `INSERT INTO anotacoes (id, titulo, conteudo) VALUES (?, ?, ?)`,
            [annotation.id, annotation.titulo, annotation.conteudo],
            (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(annotation.id);
              }
            }
          );
        }
      });
    });
  },

  // NOVO: Carregar todas as anotações
  loadAnnotations: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM anotacoes', (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
  },

  // NOVO: Excluir uma anotação
  deleteAnnotation: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM anotacoes WHERE id = ?', [id], (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
};

module.exports = dbOperations;
