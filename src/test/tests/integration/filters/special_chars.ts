import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"§" custom filter';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ 'foo'|§ }}`
        };
    }

    getExpected() {
        return `
§foo§
`;
    }
}

runTest(createIntegrationTest(new Test()));
