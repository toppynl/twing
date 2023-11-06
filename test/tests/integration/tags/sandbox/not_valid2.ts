import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"sandbox" tag';
    }

    getTemplates() {
        return {
            'foo.twig': `
foo`,
            'index.twig': `
{%- sandbox %}
    {%- include "foo.twig" %}

    {% if 1 %}
        {%- include "foo.twig" %}
    {% endif %}
{%- endsandbox %}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingParsingError: Only "include" tags are allowed within a "sandbox" section in "index.twig" at line 5.'
    }
}

runTest(createIntegrationTest(new Test));
