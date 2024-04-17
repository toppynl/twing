import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"even" test';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ 1 is even ? 'ko' : 'ok' }}
{{ 2 is even ? 'ok' : 'ko' }}
{{ 1 is not even ? 'ok' : 'ko' }}
{{ 2 is not even ? 'ko' : 'ok' }}`
        };
    }

    getExpected() {
        return `
ok
ok
ok
ok
`;
    }
}

runTest(createIntegrationTest(new Test));
