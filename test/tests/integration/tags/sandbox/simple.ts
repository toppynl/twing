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
{%- endsandbox %}

{%- sandbox %}
    {%- include "foo.twig" %}
    {%- include "foo.twig" %}
{%- endsandbox %}

{%- sandbox %}{% include "foo.twig" %}{% endsandbox %}`
        };
    }

    getExpected() {
        return `
foo
foo
foo
foo
`;
    }

}

runTest(createIntegrationTest(new Test));
