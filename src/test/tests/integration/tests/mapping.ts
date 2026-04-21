import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"mapping" test';
    }

    getTemplates() {
        return {
            'index.twig': `{{ {'a': 1} is mapping ? 'ok' : 'ko' }}
{{ [1, 2, 3] is mapping ? 'ko' : 'ok' }}
{{ [] is mapping ? 'ko' : 'ok' }}
{{ mapVar is mapping ? 'ok' : 'ko' }}
{{ seqVar is mapping ? 'ko' : 'ok' }}`
        };
    }

    getExpected() {
        return `ok
ok
ok
ok
ok`;
    }

    getContext() {
        return {
            mapVar: new Map([['a', 1], ['b', 2]]),
            seqVar: [10, 20, 30]
        };
    }
}

runTest(createIntegrationTest(new Test));
