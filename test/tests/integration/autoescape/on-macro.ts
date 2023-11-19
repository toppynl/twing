import {runTest} from "../TestBase";

runTest({
    description: 'Auto-escaping on macro',
    templates: {
        "index.twig": `
{% macro foo() %}
<br/>
{% endmacro %}
{{ _self.foo() }}
`
    },
    trimmedExpectation: '<br/>'
});
