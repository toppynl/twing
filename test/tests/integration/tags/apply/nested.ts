import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"apply" tags can be nested at will';
    }

    getTemplates() {
        return {
            'index.twig': `
{% apply lower|title %}
  {{ var }}
  {% apply upper %}
    {{ var }}
  {% endapply %}
  {{ var }}
{% endapply %}`
        };
    }

    getExpected() {
        return `
  Var
      Var
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
