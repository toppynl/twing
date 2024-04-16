import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"§" custom tag';
    }

    getTemplates() {
        return {
            'index.twig': `
{% § %}`
        };
    }

    getExpected() {
        return `
§
`;
    }

}

runTest(createIntegrationTest(new Test()));
