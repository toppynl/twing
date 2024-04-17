import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Twing unary operators precedence';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ -1 - 1 }}
{{ -1 - -1 }}
{{ -1 * -1 }}
{{ 4 / -1 * 5 }}`
        };
    }

    getExpected() {
        return `
-2
0
1
-20
`;
    }
}

runTest(createIntegrationTest(new Test));
