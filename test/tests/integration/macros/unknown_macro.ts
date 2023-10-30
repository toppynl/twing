import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'unknown macro';
    }

    getTemplates() {
        return {
            'index.twig': `
{% import _self as macros %}

{{ macros.unknown() }}
`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingErrorRuntime: Macro "unknown" is not defined in template "index.twig" in "index.twig" at line 4.';
    }
}

runTest(createIntegrationTest(new Test));
