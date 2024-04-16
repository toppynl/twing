import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"extends" tag';
    }

    getTemplates() {
        return {
            'foo.twig': `
{% block content %}{% endblock %}`,
            'index.twig': `
{% extends "foo.twig" %}

{% block content %}
    FOO
{% endblock %}`
        };
    }

    getExpected() {
        return `
FOO`;
    }

}

runTest(createIntegrationTest(new Test));
