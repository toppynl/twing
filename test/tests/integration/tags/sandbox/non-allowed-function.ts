import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"sandbox" tag with non-allowed function';
    }

    getTemplates() {
        return {
            'foo.twig': `{{ dump() }}`,
            'index.twig': `
{%- sandbox %}
    {%- include "foo.twig" %}
{%- endsandbox %}
`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingSandboxSecurityError: Function "dump" is not allowed in "foo.twig" at line 1, column 4.';
    }
}

runTest(createIntegrationTest(new Test));
