import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"sequence" test';
    }

    getTemplates() {
        return {
            'index.twig': `{{ [1, 2, 3] is sequence ? 'ok' : 'ko' }}
{{ {'a': 1} is sequence ? 'ko' : 'ok' }}
{{ [] is sequence ? 'ok' : 'ko' }}
{{ seqVar is sequence ? 'ok' : 'ko' }}
{{ mapVar is sequence ? 'ko' : 'ok' }}`
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
            seqVar: [10, 20, 30],
            mapVar: new Map([['a', 1], ['b', 2]])
        };
    }
}

runTest(createIntegrationTest(new Test));
