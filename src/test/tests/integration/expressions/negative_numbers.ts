import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Twing manages negative numbers correctly';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ -1 }}
{{ - 1 }}
{{ 5 - 1 }}
{{ 5-1 }}
{{ 5 + -1 }}
{{ 5 + - 1 }}`
        };
    }

    getExpected() {
        return `
-1
-1
4
4
4
4
`;
    }
}

runTest(createIntegrationTest(new Test));
