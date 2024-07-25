import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"for" tag can iterate over keys';
    }

    getTemplates() {
        return {
            'index.twig': `
{% for key in items|keys %}
  * {{ key }}
{% endfor %}`
        };
    }

    getExpected() {
        return `
  * 0
  * 1
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
