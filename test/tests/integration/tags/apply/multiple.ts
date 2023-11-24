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
}

runTest(createIntegrationTest(new Test));
