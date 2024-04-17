import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"sandbox" tag considers the "range" operator as an alias of the "range" function';
    }

    getTemplates() {
        return {
            'index.twig': `
{% sandbox %}
    {% include "foo.twig" %}
{% endsandbox %}
`,
            'foo.twig': `
{{ 1..5 }}
`
        };
    }

    getExpectedErrorMessage(): string {
        return 'TwingRuntimeError: Function "range" is not allowed in "foo.twig" at line 2, column 5.';
    }
}

runTest(createIntegrationTest(new Test));
