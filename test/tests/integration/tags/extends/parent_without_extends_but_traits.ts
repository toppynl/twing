import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getTemplates() {
        return {
            'foo.twig': `
{% block content %}BAR{% endblock %}`,
            'index.twig': `
{% use 'foo.twig' %}

{% block content %}
    {{ parent() }}
{% endblock %}`
        };
    }

    getExpected() {
        return `
BAR
`;
    }

}

runTest(createIntegrationTest(new Test));
