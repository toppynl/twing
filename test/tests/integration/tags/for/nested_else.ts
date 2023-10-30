import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"for" tag can use an "else" clause';
    }

    getTemplates() {
        return {
            'index.twig': `
{% for item in items %}
  {% for item in items1 %}
    * {{ item }}
  {% else %}
    no {{ item }}
  {% endfor %}
{% else %}
  no item1
{% endfor %}`
        };
    }

    getExpected() {
        return `
no a
        no b
`;
    }


    getContext() {
        return {
            items: ['a', 'b'],
            items1: [] as any[]
        };
    }
}

runTest(createIntegrationTest(new Test));
