import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"autoescape" tags can be nested at will';
    }

    getTemplates() {
        return {
            'index.twig': `
{% set var = "<br />" %}
{% autoescape false %}
    {{ var }}
    {% autoescape 'html' %}
        html: {{ var }}
        {% autoescape false %}
            false: {{ var }}
            {% autoescape 'html' %}
                html: {{ var }}
            {% endautoescape %}
            false: {{ var }}
        {% endautoescape %}
        html: {{ var }}
    {% endautoescape %}
    {{ var }}
{% endautoescape %}`
        };
    }

    getExpected() {
        return `
<br />
            html: &lt;br /&gt;
                    false: <br />
                            html: &lt;br /&gt;
                        false: <br />
                html: &lt;br /&gt;
        <br />
`;
    }
}

runTest(createIntegrationTest(new Test));
