import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"sandbox" tag with non-allowed tag';
    }

    getTemplates() {
        return {
            'foo.twig': `{% do 1 + 2 %}`,
            'index.twig': `
{%- sandbox %}
    {%- include "foo.twig" %}
{%- endsandbox %}
`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingRuntimeError: Tag "do" is not allowed in "foo.twig" at line 1, column 4.';
    }
}

runTest(createIntegrationTest(new Test));
