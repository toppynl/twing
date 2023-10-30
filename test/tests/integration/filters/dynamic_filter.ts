import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'dynamic filter';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ 'bar'|foo_path }}
{{ 'bar'|a_foo_b_bar }}`
        };
    }

    getExpected() {
        return `
foo/bar
a/b/bar
`;
    }
}

runTest(createIntegrationTest(new Test()));
