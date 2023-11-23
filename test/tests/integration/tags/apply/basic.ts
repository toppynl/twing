import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"apply" tag applies a filter on its children';
    }

    getTemplates() {
        return {
            'index.twig': `
{% apply upper %}
    Some text with a {{ var }}
{% endapply %}`
        };
    }

    getExpected() {
        return `
SOME TEXT WITH A VAR
`;
    }

    getContext() {
        return {
            var: 'var'
        };
    }
    
    getType(): "template" | "execution context" | undefined {
        return "execution context";
    }
}

runTest(createIntegrationTest(new Test));
