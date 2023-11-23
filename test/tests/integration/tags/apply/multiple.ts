import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"apply" tags accept multiple chained filters';
    }

    getTemplates() {
        return {
            'index.twig': `
{% apply lower|title %}
  {{ var }}
{% endapply %}`
        };
    }

    getExpected() {
        return `
    Var
`;
    }

    getContext() {
        return {
            var: 'VAR'
        }
    }

    getType(): "template" | "execution context" | undefined {
        return "execution context";
    }
}

runTest(createIntegrationTest(new Test));
