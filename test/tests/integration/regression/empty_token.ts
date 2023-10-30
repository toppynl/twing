import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Twig outputs 0 nodes correctly';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ foo }}0{{ foo }}`
        };
    }

    getExpected() {
        return `
foo0foo
`;
    }

    getContext() {
        return {
            foo: 'foo'
        }
    }
}

runTest(createIntegrationTest(new Test));
