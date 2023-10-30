import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"for" tag containing "with" tag';
    }

    getTemplates() {
        return {
            'index.twig': `{% for value in values -%}
    {% with value -%}
        {% with foo -%}
            {{- i -}}
        {%- endwith %}
    {%- endwith %}
{%- endfor %}`
        };
    }

    getExpected() {
        return `12`;
    }


    getContext() {
        return {
            values: [
                {
                    foo: {
                        i: 1
                    }
                },
                {
                    foo: {
                        i: 2
                    }
                }
            ]
        };
    }
}

runTest(createIntegrationTest(new Test));
