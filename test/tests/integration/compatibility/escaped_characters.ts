import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'escaped character is rendered as-is in text';
    }

    getTemplates() {
        return {
            'index.twig': 'a\\nb'
        };
    }

    getExpected() {
        return 'a\\nb';
    }
}

runTest(createIntegrationTest(new Test));
