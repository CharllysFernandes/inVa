// Importa constantes globais de constant.js
const CATEGORY_STEP1_ID = window.INVA_CONSTANTS.CATEGORY_STEP1_ID;
const REQUEST_DESCRIPTION_ID = window.INVA_CONSTANTS.REQUEST_DESCRIPTION_ID;
const REQUEST_DESCRIPTION_STORAGE_KEY = window.INVA_CONSTANTS.REQUEST_DESCRIPTION_STORAGE_KEY;

/**
 * Restaura o valor salvo no body do CKEditor assim que estiver disponível.
 * Utiliza MutationObserver e intervalos para garantir que o elemento esteja pronto.
 */
function restoreCKEditorDescription() {
    /**
     * Insere a descrição no CKEditor.
     * @returns {boolean} - Retorna true se a inserção foi bem-sucedida, false caso contrário.
     */
    function insertDescriptionInCKEditor() {
        const value = localStorage.getItem(REQUEST_DESCRIPTION_STORAGE_KEY) || '';
        const textareaId = 'form_create_description';
        const textarea = document.getElementById(textareaId);
        if (!textarea) return false;

        // Usar somente o fallback: inserir diretamente no iframe correspondente
        const iframe = document.querySelector(`#cke_${textareaId} iframe.cke_wysiwyg_frame`);
        if (iframe) {
            try {
                const doc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
                if (!doc) return false;
                if (doc.readyState !== 'complete' && doc.readyState !== 'interactive') return false;
                let p = doc.body.querySelector('p');
                if (!p) {
                    p = doc.createElement('p');
                    doc.body.appendChild(p);
                }
                if (value) p.innerHTML = value;
                textarea.value = value || '';
                console.log('[CKEditor][iframe] Valor restaurado:', value);

                // Limpa o valor do localStorage após inserção bem-sucedida
                localStorage.removeItem(REQUEST_DESCRIPTION_STORAGE_KEY);
                console.log('[CKEditor][iframe] Valor do localStorage removido.');
                return true;
            } catch (e) {
                console.warn('Erro ao acessar iframe do CKEditor:', e);
                return false;
            }
        }
        return false;
    }

    if (!insertDescriptionInCKEditor()) {
        const observer = new MutationObserver(() => {
            if (insertDescriptionInCKEditor()) observer.disconnect();
        });
        observer.observe(document.body, { childList: true, subtree: true });

        const iframeSelector = `#cke_form_create_description iframe.cke_wysiwyg_frame`;
        let tries = 0;
        const maxTries = 40;
        const interval = setInterval(() => {
            const f = document.querySelector(iframeSelector);
            if (f) {
                if (insertDescriptionInCKEditor()) {
                    clearInterval(interval);
                    observer.disconnect();
                } else {
                    f.addEventListener('load', () => {
                        insertDescriptionInCKEditor();
                        observer.disconnect();
                        clearInterval(interval);
                    }, { once: true });
                }
            }
            if (++tries > maxTries) clearInterval(interval);
        }, 250);
    }
}

// Auto-run restore
try { restoreCKEditorDescription(); } catch (e) { console.warn('restoreCKEditorDescription failed', e); }

/**
 * Cria o editor CKEditor e adiciona um listener para salvar a descrição no localStorage.
 */
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
