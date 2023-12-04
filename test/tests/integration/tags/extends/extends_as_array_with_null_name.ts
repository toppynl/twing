import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"extends" tag with array and a null name';
    }

    getTemplates() {
        return {
            'bar.twig': `
{% block content %}
    foo
{% endblock %}`,
            'index.twig': `
{% extends [null, "bar.twig"] %}`
        };
    }

    getExpected() {
        return `
foo
`;
    }

}

runTest(createIntegrationTest(new Test));
