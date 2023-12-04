import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getTemplates() {
        return {
            'foo.twig': `
{% block content %}FOO{% endblock %}`,
            'index.twig': `
{% extends "foo.twig" %}`
        };
    }

    getExpected() {
        return `
FOO
`;
    }

}

runTest(createIntegrationTest(new Test));
