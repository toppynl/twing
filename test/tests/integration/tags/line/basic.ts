import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"line" tag is supported';
    }

    getTemplates() {
        return {
            'index.twig': `
{% line 5 %}
{{ unknown }}
`
        };
    }

    getExpectedErrorMessage(): string {
        return 'TwingRuntimeError: Variable `unknown` does not exist in "index.twig" at line 6.';
    }
}

runTest(createIntegrationTest(new Test));
