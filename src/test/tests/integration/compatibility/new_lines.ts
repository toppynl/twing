import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'all flavors of new lines are rendered as line feeds';
    }

    getTemplates() {
        return {
            'index.twig': '\r\rfoo\r\nbar\roof\n\r'
        };
    }

    getExpected() {
        return '\n\nfoo\nbar\noof\n\n';
    }
}

runTest(createIntegrationTest(new Test));
