import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Twing supports the nullish coalescing operator';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ 1 ?? 'wrong' }}
{{ 0 ?? 'wrong' }}
{{ null ?? 'right' }}
{{ foo ?? 'right' }}`
        };
    }

    getExpected() {
        return `
1
0
right
right
`;
    }

    getContext() {
        return {
            foo: null
        }
    }
}

runTest(createIntegrationTest(new Test()));
