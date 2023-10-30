import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";
import {TwingEnvironmentOptions} from "../../../../../src/lib/environment";

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
        return 'TwingSandboxSecurityError: Function "range" is not allowed in "foo.twig" at line 2.';
    }

    getEnvironmentOptions(): TwingEnvironmentOptions {
        return {
            escapingStrategy: false
        }
    }
}

runTest(createIntegrationTest(new Test));
