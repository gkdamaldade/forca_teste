import express from 'express';
import { Sala } from '../models'; // ✅ ADICIONE: importa o modelo Sequelize

// descomente para exigir JWT e obter o hostId do token. precisa?
// import jwt from 'jsonwebtoken';

const router = express.Router();

/**
 * Função para gerar código único para a sala
 */
function gerarCodigoSala(tamanho = 6) {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < tamanho; i++) {
    codigo += letras.charAt(Math.floor(Math.random() * letras.length));
  }
  return codigo;
}

/** (Opcional) middleware para validar JWT do Authorization: Bearer <token> */
function authOptional(req, _res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || 'dev-secret';
    // const payload = jwt.verify(token, secret);
    req.user = { id: null, name: null }; // ✅ MOCK: ajuste quando usar JWT real
    return next();
  } catch {
    req.user = null;
    return next();
  }
}

/**
 * ✅ SUBSTITUIR lógica do Map por DB
 * POST /api/salas
 * body: { categoria: string }
 * retorna: { sala: string, categoria: string }
 */
router.post('/salas', authOptional, async (req, res) => {
  const { categoria } = req.body ?? {};
  if (!categoria || typeof categoria !== 'string') {
    return res.status(400).json({ message: 'Categoria é obrigatória.' });
  }

  try {
    // Gera código único verificando no banco
    let codigo;
    let existe;
    do {
      codigo = gerarCodigoSala();
      existe = await Sala.findOne({ where: { codigo } });
    } while (existe);

    const hostId = req.user?.id ?? null;

    const novaSala = await Sala.create({
      codigo,
      categoria,
      hostId,
      createdAt: new Date()
    });

    return res.status(201).json({ sala: novaSala.codigo, categoria: novaSala.categoria });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao criar sala.' });
  }
});

/**
 * ✅ SUBSTITUIR lógica do Map por DB
 * GET /api/salas/:codigo
 */
router.get('/salas/:codigo', async (req, res) => {
  const codigo = (req.params.codigo || '').toUpperCase();
  try {
    const sala = await Sala.findOne({ where: { codigo } });
    if (!sala) return res.status(404).json({ message: 'Sala não encontrada.' });
    return res.json({ sala: sala.codigo, categoria: sala.categoria });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao buscar sala.' });
  }
});

/**
 *  SUBSTITUIR lógica do Map por DB
 * DELETE /api/salas/:codigo
 */
router.delete('/salas/:codigo', async (req, res) => {
  const codigo = (req.params.codigo || '').toUpperCase();
  try {
    const deletadas = await Sala.destroy({ where: { codigo } });
    if (!deletadas) return res.status(404).json({ message: 'Sala não encontrada.' });
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao deletar sala.' });
  }
});

export default router;
