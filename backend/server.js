const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERRO: Variáveis do Supabase ausentes no .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('🧸 Conexão com Supabase OK!');

/* ===========================
   🔍 TESTE DA API
=========================== */
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'API da Loja de Brinquedos funcionando! 🧸✨',
        timestamp: new Date().toISOString()
    });
});

/* ===========================
   📦 BUSCAR BRINQUEDOS
=========================== */
app.get('/api/brinquedos', async (req, res) => {
    try {
        console.log('📋 Buscando brinquedos...');

        const { data, error } = await supabase
            .from('brinquedos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Erro ao buscar brinquedos:', error);
            return res.status(400).json({
                success: false,
                message: 'Erro ao buscar brinquedos',
                error: error.message
            });
        }

        res.json({
            success: true,
            total: data.length,
            data
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/* ===========================
   ➕ CADASTRAR BRINQUEDO
=========================== */
app.post('/api/brinquedos', async (req, res) => {
    try {
        const { nome, categoria, idade_recomendada, preco, descricao } = req.body;

        console.log('🎁 Cadastrando brinquedo:', req.body);

        // validações
        if (!nome || !categoria || !preco) {
            return res.status(400).json({
                success: false,
                message: 'Campos obrigatórios: nome, categoria e preco'
            });
        }

        if (isNaN(preco) || preco <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Preço inválido'
            });
        }

        const { data, error } = await supabase
            .from('brinquedos')
            .insert([
                {
                    nome: nome.trim(),
                    categoria: categoria.trim(),
                    idade_recomendada: idade_recomendada ? idade_recomendada.trim() : null,
                    preco: parseFloat(preco),
                    descricao: descricao ? descricao.trim() : null
                }
            ])
            .select();

        if (error) {
            console.error('❌ Erro ao cadastrar brinquedo:', error);
            return res.status(400).json({
                success: false,
                message: 'Erro ao cadastrar brinquedo',
                error: error.message
            });
        }

        res.status(201).json({
            success: true,
            message: 'Brinquedo cadastrado com sucesso! 🧸🎉',
            data: data[0]
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/* ===========================
   🗑️ EXCLUIR BRINQUEDO
=========================== */
app.delete('/api/brinquedos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        console.log('🗑️ Excluindo brinquedo ID:', id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const { data, error } = await supabase
            .from('brinquedos')
            .delete()
            .eq('id', parseInt(id))
            .select();

        if (error) {
            console.error('❌ Erro ao excluir brinquedo:', error);
            return res.status(400).json({
                success: false,
                message: 'Erro ao excluir brinquedo',
                error: error.message
            });
        }

        if (data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Brinquedo não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Brinquedo excluído com sucesso! 🧹✨',
            data: data[0]
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/* ===========================
   🌐 FRONT-END
=========================== */
app.use(express.static('../frontend'));

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Rota não encontrada',
        routes: [
            'GET /api/test',
            'GET /api/brinquedos',
            'POST /api/brinquedos',
            'DELETE /api/brinquedos/:id'
        ]
    });
});

/* ===========================
   🚀 INICIAR SERVIDOR
=========================== */
app.listen(PORT, () => {
    console.log('🧸🎈 SERVIDOR DA LOJA DE BRINQUEDOS RODANDO!');
    console.log(`📡 http://localhost:${PORT}`);
});
