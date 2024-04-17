import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"include" function with an array of templates';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ include(["foo.twig", "bar.twig"]) }}
{{- include(["bar.twig", "foo.twig"]) }}`,
            'foo.twig': `
foo`
        };
    }

    getExpected() {
        return `
foo
foo
`;
    }
}

runTest(createIntegrationTest(new Test()));
