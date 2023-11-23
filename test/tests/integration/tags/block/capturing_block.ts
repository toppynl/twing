import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return 'capturing "block" tag';
    }

    getTemplates() {
        return {
            'index.twig': `
{% set foo %}{% block foo %}FOO{% endblock %}{% endset %}
{{ foo }}
{% spaceless %}
    {% block bar %}
        <h1>
            <b>Title</b>
        </h1>
    {% endblock %}
{% endspaceless %}

{{ block('bar') }}`
        };
    }

    getExpected() {
        return `
FOO
<h1><b>Title</b></h1>
        <h1>
            <b>Title</b>
        </h1>
`;
    }


    getContext() {
        return {};
    }

    getExpectedDeprecationMessages() {
        return [
            'The "spaceless" tag in "index.twig" at line 4 is deprecated since Twig 2.7, use the "spaceless" filter instead.'
        ];
    }
    
    getType(): "template" | "execution context" | undefined {
        return "execution context";
    }
}

runTest(createIntegrationTest(new Test));
