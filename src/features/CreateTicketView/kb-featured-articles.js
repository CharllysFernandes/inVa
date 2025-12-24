/**
 * 1. Só deve ser iniciada quando content script detectar que está na página de criação de ticket.
 * 2. Verificar valor no localStorage com a chave 'switch_kb_featured_articles' (true/false).
 * 3. Usar mutation observer para detectar div com id=featured_kb_articles
 * 4. Quando estiver na página atribuir style = display:none para ocultar a div de acordo com o valor salvo em localStorage com a chave 'switch_kb_featured_articles' (true/false).
 * 5. Cancelar o mutation observer.
 */

function featured_kb_articles() {
    console.log('Iniciando ocultação/habilitação de artigos destacados da KB.');

    const savedValue = localStorage.getItem('switch_kb_featured_articles');

    console.log('Valor salvo para switch_kb_featured_articles:', savedValue);

}

window.initKbFeaturedArticles = featured_kb_articles;