import {runTest} from "../../TestBase";

runTest({
   description: '"autoescape" tag applies escaping on embedded blocks',
    templates: {
        'index.twig': `
{% set var = "<br/>" %}
{% autoescape 'html' %}
    {% block foo %}
        {% autoescape false %}
            {{ var }}
        {% endautoescape %}
        {{ var }}
    {% endblock %}
{% endautoescape %}`
    },
    expectation: `
                        <br/>
                &lt;br/&gt;
    `
});
