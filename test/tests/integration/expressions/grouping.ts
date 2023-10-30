import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Twing supports grouping of expressions';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ (2 + 2) / 2 }}`
        };
    }

    getExpected() {
        return `
2
`;
    }
}

runTest(createIntegrationTest(new Test));
