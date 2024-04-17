import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'issue #360';
    }

    getTemplates() {
        return {
            'index.twig': `
{% set aaa = ["apple", "banana", "peach", "plum"] %}
{{ aaa|slice(1, 2)|json_encode|raw }}`
        };
    }

    getExpected() {
        return `
["banana","peach"]`;
    }
}

runTest(createIntegrationTest(new Test));
