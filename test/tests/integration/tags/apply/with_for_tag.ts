import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"apply" tag applies the filter on "for" tags';
    }

    getTemplates() {
        return {
            'index.twig': `
{% apply upper %}
{% for item in items %}
{{ item }}
{% endfor %}
{% endapply %}`
        };
    }

    getExpected() {
        return `
A
B
`;
    }

    getContext() {
        return {
            items: [
                'a',
                'b'
            ]
        }
    }

    getType(): "template" | "execution context" | undefined {
        return "execution context";
    }
}

runTest(createIntegrationTest(new Test));
