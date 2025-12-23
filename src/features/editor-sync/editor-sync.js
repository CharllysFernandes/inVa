// Cria um ckeditor e injeta o HTML customizado

function createCKEditor() {
    console.log(`Criando editor CKEditor...`);
    const container = document.getElementById('category_step1');
    if (container && window.EDITOR_HTML) {
        const temp = document.createElement('div');
        temp.innerHTML = window.EDITOR_HTML;
        // Adiciona todos os elementos do template como primeiros filhos
        Array.from(temp.children).reverse().forEach(child => {
            container.insertBefore(child, container.firstChild);
        });
    } else {
        console.warn('Container category_step1 não encontrado ou EDITOR_HTML não definido.');
    }
}

window.createCKEditor = createCKEditor;