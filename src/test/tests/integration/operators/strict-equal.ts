import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"===" strict equality operator';
    }

    getTemplates() {
        return {
            'index.twig': `{{ 1 === 1 ? 'ok' : 'ko' }}
{{ 1 === '1' ? 'ko' : 'ok' }}
{{ null === null ? 'ok' : 'ko' }}
{{ null === false ? 'ko' : 'ok' }}`
        };
    }

    getExpected() {
        return `ok
ok
ok
ok`;
    }
}

runTest(createIntegrationTest(new Test));
