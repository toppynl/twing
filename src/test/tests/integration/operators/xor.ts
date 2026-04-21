import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"xor" logical operator';
    }

    getTemplates() {
        return {
            'index.twig': `{{ (true xor true) ? 'ko' : 'ok' }}
{{ (true xor false) ? 'ok' : 'ko' }}
{{ (false xor true) ? 'ok' : 'ko' }}
{{ (false xor false) ? 'ko' : 'ok' }}`
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
