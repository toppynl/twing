import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"find" filter';
    }

    getTemplates() {
        return {
            'index.twig': `
{% set offset = 3 %}
{{ [1, 5, 3, 4]|find(v => v > offset) }}
{{ {a: 1, b: 5, c: 3}|find(v => v > offset) }}
{{ [1, 2]|find(v => v > offset) }}
`
        };
    }

    getExpected() {
        return `
5
5

`;
    }
}

runTest(createIntegrationTest(new Test()));
