import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return 'conditional "block" tag';
    }

    getTemplates() {
        return {
            'index.twig': `
{% if false %}{% block foo %}FOO{% endblock %}{% endif %}
{% if true %}{% block bar %}BAR{% endblock %}{% endif %}`
        };
    }

    getExpected() {
        return `
BAR
`;
    }


    getContext() {
        return {};
    }
}

runTest(createIntegrationTest(new Test));
