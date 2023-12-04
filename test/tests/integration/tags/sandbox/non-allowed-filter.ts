import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"sandbox" tag with non-allowed filter';
    }

    getTemplates() {
        return {
            'foo.twig': `{{ "foo"|upper }}`,
            'index.twig': `
{%- sandbox %}
    {%- include "foo.twig" %}
{%- endsandbox %}
`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingSandboxSecurityError: Filter "upper" is not allowed in "foo.twig" at line 1, column 10.';
    }
}

runTest(createIntegrationTest(new Test));
