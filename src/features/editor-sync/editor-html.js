// HTML do editor para ser injetado
const EDITOR_HTML = `
<div class="requestCategoryTitles" style="margin: 5px 0 5px 0;">
    <div class="requestCategoryTitle" role="heading" aria-level="2">Descrição Rápida:</div>
</div>
<div class="requestCategorySearch sectionSearch sectionSearch--big">
    <div class="sectionSearchIcon">
        <div class="fa fa-commenting"></div>
    </div>
    <input id="request_description" placeholder="Adicione aqui as primeiras informações sobre o chamado" aria-label="Informações rápidas para descrição de chamado" class="textSearchBinded" autocomplete="on">
    
</div>
`;

window.EDITOR_HTML = EDITOR_HTML;
