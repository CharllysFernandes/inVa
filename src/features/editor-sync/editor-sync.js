// Restaura o valor salvo no body do CKEditor assim que estiver disponível
// Utiliza constantes globais para IDs e storage
const CATEGORY_STEP1_ID = window.CATEGORY_STEP1_ID || 'category_step1';
const REQUEST_DESCRIPTION_ID = window.REQUEST_DESCRIPTION_ID || 'request_description';
const REQUEST_DESCRIPTION_STORAGE_KEY = window.REQUEST_DESCRIPTION_STORAGE_KEY || 'request_description_text';

function restoreCKEditorDescription() {
    function insertDescriptionInCKEditor() {
        const value = localStorage.getItem(REQUEST_DESCRIPTION_STORAGE_KEY) || '';
        const textareaId = 'form_create_description';
        const textarea = document.getElementById(textareaId);
        if (!textarea) return false;

        // 1) Usar CKEditor API se disponível
        try {
            if (window.CKEDITOR && CKEDITOR.instances && CKEDITOR.instances[textareaId]) {
                CKEDITOR.instances[textareaId].setData(value || '');
                textarea.value = value || '';
                console.log('[CKEditor][API] Valor restaurado via CKEDITOR.setData:', value);
                return true;
            }
        } catch (e) {
            console.warn('CKEDITOR API error:', e);
        }

        // 2) Fallback: inserir diretamente no iframe correspondente
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
