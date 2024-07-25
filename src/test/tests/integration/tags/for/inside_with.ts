import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"for" tag inside a "with" tag';
    }

    getTemplates() {
        return {
            'index.twig': `{% with foo %}
    {% for i in bar -%}
        {{- i -}}
    {%- endfor %}
{% endwith %}`
        };
    }

    getExpected() {
        return `12`;
    }


    getContext() {
        return {
            foo: {
                bar: [1, 2]
            }
        };
    }
}

runTest(createIntegrationTest(new Test));
