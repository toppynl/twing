import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getTemplates() {
        return {
            'foo.twig': `
{% block content %}{% endblock %}`,
            'index.twig': `
{% extends foo %}

{% block content %}
    FOO
{% endblock %}`
        };
    }

    getExpected() {
        return `
FOO
`;
    }


    getContext() {
        return {
            foo: 'foo.twig'
        }
    }
}

runTest(createIntegrationTest(new Test));
