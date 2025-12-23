// Restaura o valor salvo no body do CKEditor assim que estiver disponível
// Utiliza constantes globais para IDs e storage
const CATEGORY_STEP1_ID = window.CATEGORY_STEP1_ID || 'category_step1';
const REQUEST_DESCRIPTION_ID = window.REQUEST_DESCRIPTION_ID || 'request_description';
const REQUEST_DESCRIPTION_STORAGE_KEY = window.REQUEST_DESCRIPTION_STORAGE_KEY || 'request_description_text';

function createCKEditor() {
    console.log(`Criando editor CKEditor...`);
    const container = document.getElementById(CATEGORY_STEP1_ID);
    if (container && window.EDITOR_HTML) {
        const temp = document.createElement('div');
        temp.innerHTML = window.EDITOR_HTML;
        // Adiciona todos os elementos do template como primeiros filhos
        Array.from(temp.children).reverse().forEach(child => {
            container.insertBefore(child, container.firstChild);
        });
        // Após inserir, adiciona listener ao input
        const descEl = container.querySelector(`#${REQUEST_DESCRIPTION_ID}`);
        if (descEl) {
            descEl.addEventListener('input', () => {
                const value = descEl.value || descEl.innerText || '';
                localStorage.setItem(REQUEST_DESCRIPTION_STORAGE_KEY, value);
                console.log(`[${REQUEST_DESCRIPTION_ID}] salvo:`, value);
            });
        }
    } else {
        console.warn(`Container ${CATEGORY_STEP1_ID} não encontrado ou EDITOR_HTML não definido.`);
    }
}



window.createCKEditor = createCKEditor;
