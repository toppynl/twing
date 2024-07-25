import {runTest} from "../../TestBase";

runTest({
    description: '"macro" tag with varargs',
    templates: {
        "index.twig": `
{% macro foo() %}
{{ varargs[0] }}
{% endmacro %}

{{ _self.foo("bar") }}
`
    },
    expectation: `

bar

`
});
