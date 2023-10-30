import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Twing supports the ternary operator';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ 1 ? 'YES' }}
{{ 0 ? 'YES' }}`
        };
    }

    getExpected() {
        return `
YES

`;
    }
}

runTest(createIntegrationTest(new Test));
