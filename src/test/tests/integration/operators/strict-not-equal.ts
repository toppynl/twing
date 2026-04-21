import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"!==" strict inequality operator';
    }

    getTemplates() {
        return {
            'index.twig': `{{ 1 !== '1' ? 'ok' : 'ko' }}
{{ 1 !== 1 ? 'ko' : 'ok' }}
{{ null !== false ? 'ok' : 'ko' }}`
        };
    }

    getExpected() {
        return `ok
ok
ok`;
    }
}

runTest(createIntegrationTest(new Test));
