import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription(): string {
        return '"extends" tag with dynamic template name';
    }

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
