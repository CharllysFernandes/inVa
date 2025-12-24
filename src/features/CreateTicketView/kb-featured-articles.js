/**
 * 1. Só deve ser iniciada quando content script detectar que está na página de criação de ticket.
 * 2. Verificar valor no localStorage com a chave 'switch_kb_featured_articles' (true/false).
 * 3. Usar mutation observer para detectar div com id=featured_kb_articles
 * 4. Quando estiver na página atribuir style = display:none para ocultar a div de acordo com o valor salvo em localStorage com a chave 'switch_kb_featured_articles' (true/false).
 * 5. Cancelar o mutation observer.
 */

function featured_kb_articles() {
    console.log('Iniciando ocultação/habilitação de artigos destacados da KB.');

    // Aguarda até o timeout definido para o elemento featured_kb_articles
    const timeoutMs = window.INVA_CONSTANTS.KB_FEATURED_ARTICLES_TIMEOUT || 300000; // fallback
    window.waitForElement('#featured_kb_articles', timeoutMs).then((found) => {
        if (!found) {
            console.warn('Elemento #featured_kb_articles não encontrado após', timeoutMs / 1000, 'segundos.');
            return;
        }

        console.log('Elemento #featured_kb_articles encontrado. Aplicando configuração.');

        // Carrega o valor de switch_kb_featured_articles
        try {
            chrome.storage.local.get(['switch_kb_featured_articles'], (result) => {
                const savedValue = result.switch_kb_featured_articles;
                console.log('Valor salvo para switch_kb_featured_articles (chrome.storage):', savedValue);
                const shouldHide = savedValue === true;
                applyKbVisibility(shouldHide);
            });
        } catch (e) {
            console.warn('chrome.storage não disponível, usando localStorage:', e);
            // fallback para localStorage da página
            const savedValue = localStorage.getItem('switch_kb_featured_articles');
            console.log('Valor salvo para switch_kb_featured_articles (localStorage):', savedValue);
            const shouldHide = savedValue === 'true';
            applyKbVisibility(shouldHide);
        }
    });

    function applyKbVisibility(shouldHide) {
        const el = document.getElementById('featured_kb_articles');
        if (el) {
            el.style.display = shouldHide ? 'none' : '';
            console.log('KB Featured Articles: visibilidade aplicada:', shouldHide ? 'oculto' : 'visível');
        } else {
            console.log('Elemento featured_kb_articles não encontrado na aplicação.');
        }
    }
}

window.initKbFeaturedArticles = featured_kb_articles;