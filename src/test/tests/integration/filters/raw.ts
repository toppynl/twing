import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"raw" filter';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ "<br/>"|raw }}`
        };
    }

    getExpected() {
        return `
<br/>`;
    }
}

runTest(createIntegrationTest(new Test()));
