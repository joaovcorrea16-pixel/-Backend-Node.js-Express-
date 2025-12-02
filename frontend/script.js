const formBrinquedo = document.getElementById('form-veiculo');
const btnCadastrar = document.getElementById('btn-cadastrar');
const btnTexto = document.getElementById('btn-texto');
const btnLoading = document.getElementById('btn-loading');

const gridBrinquedos = document.getElementById('grid-veiculos');
const listaVazia = document.getElementById('lista-vazia');
const loadingBrinquedos = document.getElementById('loading-veiculos');
const contadorBrinquedos = document.getElementById('contador-veiculos');
const totalBrinquedos = document.getElementById('total-veiculos');

const modalConfirmacao = document.getElementById('modal-confirmacao');
const brinquedoNome = document.getElementById('veiculo-nome');
const btnCancelar = document.getElementById('btn-cancelar');
const btnConfirmar = document.getElementById('btn-confirmar');

let brinquedoParaExcluir = null;

/* =====================================================
   BUSCAR BRINQUEDOS
===================================================== */
async function buscarBrinquedos() {
    loadingBrinquedos.classList.remove('hidden');
    gridBrinquedos.classList.add('hidden');
    listaVazia.classList.add('hidden');

    try {
        const res = await fetch('http://localhost:3000/api/brinquedos');
        const json = await res.json();

        if (!json.success) throw new Error(json.message);

        const brinquedos = json.data;

        if (brinquedos.length === 0) {
            listaVazia.classList.remove('hidden');
            contadorBrinquedos.classList.add('hidden');
            loadingBrinquedos.classList.add('hidden');
            return;
        }

        gridBrinquedos.innerHTML = '';

        brinquedos.forEach(b => {
            const card = document.createElement('div');
            card.className = 'bg-yellow-100 p-4 rounded-lg shadow flex flex-col justify-between border border-yellow-300';

            card.innerHTML = `
                <div>
                    <h3 class="font-bold text-lg text-toy-blue">${b.modelo}</h3>
                    <p class="text-gray-700">Marca: <span class="font-semibold">${b.marca}</span></p>
                    <p class="text-gray-700">Idade recomendada: <span class="font-semibold">${b.ano}+ anos</span></p>
                    ${b.descricao ? `<p class="text-gray-600 mt-2">${b.descricao}</p>` : ''}
                </div>

                <div class="flex justify-between items-center mt-4">
                    <span class="font-bold text-toy-pink text-lg">R$ ${b.preco.toLocaleString()}</span>

                    <button 
                        data-id="${b.id}" 
                        data-modelo="${b.modelo}" 
                        class="bg-toy-pink text-white px-3 py-1 rounded hover:bg-pink-700 transition btn-excluir"
                    >
                        🗑️
                    </button>
                </div>
            `;

            gridBrinquedos.appendChild(card);
        });

        document.querySelectorAll('.btn-excluir').forEach(btn => {
            btn.addEventListener('click', () => {
                brinquedoParaExcluir = btn.getAttribute('data-id');
                brinquedoNome.textContent = btn.getAttribute('data-modelo');
                modalConfirmacao.classList.remove('hidden');
            });
        });

        totalBrinquedos.textContent = brinquedos.length;
        contadorBrinquedos.classList.remove('hidden');
        gridBrinquedos.classList.remove('hidden');

    } catch (err) {
        console.error('Erro ao buscar brinquedos:', err);
        alert('Erro ao buscar brinquedos.');
    } finally {
        loadingBrinquedos.classList.add('hidden');
    }
}

/* =====================================================
   CADASTRAR BRINQUEDO
===================================================== */
formBrinquedo.addEventListener('submit', async (e) => {
    e.preventDefault();

    btnTexto.classList.add('hidden');
    btnLoading.classList.remove('hidden');
    btnCadastrar.disabled = true;

    const modelo = document.getElementById('modelo').value.trim();
    const marca = document.getElementById('marca').value.trim();
    const idade = parseInt(document.getElementById('ano').value);
    const preco = parseFloat(document.getElementById('preco').value);
    const descricao = document.getElementById('descricao').value.trim();

    try {
        const res = await fetch('http://localhost:3000/api/brinquedos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ modelo, marca, ano: idade, preco, descricao })
        });

        const json = await res.json();

        if (!json.success) throw new Error(json.message);

        formBrinquedo.reset();
        buscarBrinquedos();
        alert('Brinquedo cadastrado com sucesso!');

    } catch (err) {
        console.error('Erro ao cadastrar brinquedo:', err);
        alert(err.message);
    } finally {
        btnTexto.classList.remove('hidden');
        btnLoading.classList.add('hidden');
        btnCadastrar.disabled = false;
    }
});

/* =====================================================
   EXCLUIR BRINQUEDO
===================================================== */
btnConfirmar.addEventListener('click', async () => {
    if (!brinquedoParaExcluir) return;

    try {
        const res = await fetch(`http://localhost:3000/api/brinquedos/${brinquedoParaExcluir}`, {
            method: 'DELETE'
        });

        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        alert('Brinquedo excluído com sucesso!');
        modalConfirmacao.classList.add('hidden');
        brinquedoParaExcluir = null;

        buscarBrinquedos();

    } catch (err) {
        console.error('Erro ao excluir brinquedo:', err);
        alert(err.message);
    }
});

btnCancelar.addEventListener('click', () => {
    brinquedoParaExcluir = null;
    modalConfirmacao.classList.add('hidden');
});

/* =====================================================
   BOTÃO ATUALIZAR
===================================================== */
document.getElementById('btn-atualizar').addEventListener('click', buscarBrinquedos);

/* =====================================================
   INICIALIZAÇÃO
===================================================== */
document.addEventListener('DOMContentLoaded', buscarBrinquedos);
