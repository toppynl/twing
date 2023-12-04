import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"§" custom function';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ §('foo') }}`
        };
    }

    getExpected() {
        return `
§foo§
`;
    }
}

runTest(createIntegrationTest(new Test()));
