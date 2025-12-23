import { getUrlType } from '../src/shared/urlType.js';
import assert from 'assert';

function testGetUrlType() {
    // TICKET_CREATE
    assert.strictEqual(getUrlType('https://exemplo.com/incident/create'), 'TICKET_CREATE');
    assert.strictEqual(getUrlType('http://localhost/incident/create'), 'TICKET_CREATE');

    // TICKET_SHOW_VIEW
    assert.strictEqual(getUrlType('https://exemplo.com/views/index/show/view_id/123'), 'TICKET_SHOW_VIEW');
    assert.strictEqual(getUrlType('http://localhost/views/index/show/view_id/'), 'TICKET_SHOW_VIEW');

    // REQUESTS_SHOW_ID
    assert.strictEqual(getUrlType('https://exemplo.com/requests/show/index/id/456'), 'REQUESTS_SHOW_ID');
    assert.strictEqual(getUrlType('http://localhost/requests/show/index/id'), 'REQUESTS_SHOW_ID');

    // UNKNOWN
    assert.strictEqual(getUrlType('https://exemplo.com/other/path'), 'UNKNOWN');
    assert.strictEqual(getUrlType(''), null);
    assert.strictEqual(getUrlType(null), null);
    assert.strictEqual(getUrlType(undefined), null);

    console.log('Todos os testes passaram!');
}

try {
    testGetUrlType();
} catch (err) {
    console.error('Teste falhou:', err.message);
    process.exit(1);
}
