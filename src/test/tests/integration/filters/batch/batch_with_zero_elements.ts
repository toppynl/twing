import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"batch" filter with zero elements\n';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ []|batch(3)|length }}
{{ []|batch(3, 'fill')|length }}`
        };
    }

    getExpected() {
        return `
0
0
`;
    }
}

runTest(createIntegrationTest(new Test()));
