import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"escape" filter';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ "foo <br />"|e }}`
        };
    }

    getExpected() {
        return `
foo &lt;br /&gt;
`;
    }
}

runTest(createIntegrationTest(new Test()));
