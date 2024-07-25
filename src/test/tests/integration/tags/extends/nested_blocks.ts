import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getTemplates() {
        return {
            'foo.twig': `
{% block content %}
    {% block subcontent %}
        SUBCONTENT
    {% endblock %}
{% endblock %}`,
            'index.twig': `
{% extends "foo.twig" %}

{% block content %}
    {% block subcontent %}
        {% block subsubcontent %}
            SUBSUBCONTENT
        {% endblock %}
    {% endblock %}
{% endblock %}`
        };
    }

    getExpected() {
        return `
SUBSUBCONTENT
`;
    }

}

runTest(createIntegrationTest(new Test));
