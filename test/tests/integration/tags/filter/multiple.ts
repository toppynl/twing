import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"filter" tags accept multiple chained filters';
    }

    getTemplates() {
        return {
            'index.twig': `
{% filter lower|title %}
  {{ var }}
{% endfilter %}`
        };
    }

    getExpected() {
        return `
    Var
`;
    }


    getExpectedDeprecationMessages() {
        return [
            'The "filter" tag in "index.twig" at line 2 is deprecated since Twig 2.9, use the "apply" tag instead.'
        ];
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
