import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"include" function with ignore_missing';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ include(["foo.twig", "bar.twig"], ignore_missing = true) }}
{{ include("foo.twig", ignore_missing = true) }}
{{ include("foo.twig", ignore_missing = true, variables = {}) }}
{{ include("foo.twig", ignore_missing = true, variables = {}, with_context = true) }}`
        };
    }

    getExpected() {
        return `
`;
    }
}

runTest(createIntegrationTest(new Test()));
