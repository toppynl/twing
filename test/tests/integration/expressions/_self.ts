import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '_self returns the template name';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ _self }}`
        };
    }

    getExpected() {
        return `
index.twig
`;
    }
}

runTest(createIntegrationTest(new Test));
