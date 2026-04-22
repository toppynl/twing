import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"types" tag is a no-op placeholder for static type declarations (Twig 3.13+)';
    }

    getTemplates() {
        return {
            'index.twig': `{% types {name: 'string', age: 'int'} %}Hello`
        };
    }

    getExpected() {
        return `Hello`;
    }
}

runTest(createIntegrationTest(new Test()));
