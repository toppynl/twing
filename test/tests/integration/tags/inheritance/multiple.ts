import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getTemplates() {
        return {
            'base.twig': `
{% block content %}base {% endblock %}`,
            'index.twig': `
{% extends "layout.twig" %}{% block content %}{{ parent() }}index {% endblock %}`,
            'layout.twig': `
{% extends "base.twig" %}{% block content %}{{ parent() }}layout {% endblock %}`
        };
    }

    getExpected() {
        return `
base layout index
`;
    }

}

runTest(createIntegrationTest(new Test));
