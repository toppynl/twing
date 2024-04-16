import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"escape" filter plus "autoescape" tag';
    }

    getTemplates() {
        return {
            'index.twig': `
{% set foo %}
    foo<br />
{% endset %}

{{ foo|e('html') -}}
{{ foo|e('js') }}
{% autoescape false %}
    {{ foo }}
{% endautoescape %}`
        };
    }

    getExpected() {
        return `
    foo&lt;br /&gt;
\\u0020\\u0020\\u0020\\u0020foo\\u003Cbr\\u0020\\/\\u003E\\n
        foo<br />`;
    }
}

runTest(createIntegrationTest(new Test()));
