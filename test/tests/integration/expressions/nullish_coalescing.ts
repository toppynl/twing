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
{{ foo ?? 'right' }}
{{ [5] ?? 'wrong' }}
{{ bar.foo ?? 'wrong' }}
{{ constant("oof") ?? 'wrong' }}
`
        };
    }

    getExpected() {
        return `
1
0
right
right
Array
5
wrong
`;
    }

    getContext() {
        return {
            foo: null,
            bar: {
                foo: 5
            }
        }
    }
}

runTest(createIntegrationTest(new Test()));
