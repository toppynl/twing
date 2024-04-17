import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"for" tag keeps the context safe';
    }

    getTemplates() {
        return {
            'index.twig': `
{% for item in items %}
  {% for item in items %}
    * {{ item }}
  {% endfor %}
  * {{ item }}
{% endfor %}`
        };
    }

    getExpected() {
        return `
      * a
      * b
    * a
      * a
      * b
    * b
`;
    }


    getContext() {
        return {
            items: [
                'a',
                'b'
            ]
        };
    }
}

runTest(createIntegrationTest(new Test));
