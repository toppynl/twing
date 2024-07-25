import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"autoescape" tag do not applies escaping on filter arguments';
    }

    getTemplates() {
        return {
            'index.twig': `
{% set sep = "<br />" %}
{% set var = ["foo","bar"] %}
{% autoescape 'html' %}
{{ var|join("<br />") }}
{{ var|join("<br />"|escape) }}
{{ var|join(sep) }}
{{ var|join(sep|raw) }}
{% endautoescape %}`
        };
    }

    getExpected() {
        return `
foo&lt;br /&gt;bar
foo&amp;lt;br /&amp;gt;bar
foo&lt;br /&gt;bar
foo&lt;br /&gt;bar
`;
    }
}

runTest(createIntegrationTest(new Test));
