import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"autoescape" tag applies escaping on its children';
    }

    getTemplates() {
        return {
            'index.twig': `
{% set var = "<br />" %}
{% autoescape %}
    {{ var }}<br />
{% endautoescape %}
{% autoescape 'html' %}
    {{ var }}<br />
{% endautoescape %}
{% autoescape false %}
    {{ var }}<br />
{% endautoescape %}`
        };
    }

    getExpected() {
        return `
    &lt;br /&gt;<br />
    &lt;br /&gt;<br />
    <br /><br />
`;
    }
}

runTest(createIntegrationTest(new Test));
