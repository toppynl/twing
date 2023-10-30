import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"for" tags can be nested';
    }

    getTemplates() {
        return {
            'index.twig': `
{% for key, item in items %}
* {{ key }} ({{ loop.length }}):
{% for value in item %}
  * {{ value }} ({{ loop.length }})
{% endfor %}
{% endfor %}`
        };
    }

    getExpected() {
        return `
* a (2):
  * a1 (3)
  * a2 (3)
  * a3 (3)
* b (2):
  * b1 (1)
`;
    }


    getContext() {
        return {
            items: new Map([
                ['a', ['a1', 'a2', 'a3']],
                ['b', ['b1']]
            ])
        };
    }
}

runTest(createIntegrationTest(new Test));
