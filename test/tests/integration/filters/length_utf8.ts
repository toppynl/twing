import TestBase, {runTest} from "../TestBase";
import {createMarkup} from "../../../../src/lib/markup";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"length" filter';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ string|length }}
{{ markup|length }}`
        };
    }

    getExpected() {
        return `
3
3
`;
    }

    getContext() {
        return {
            string: 'été',
            markup: createMarkup(Buffer.from('foo'), 'UTF-8')
        };
    }
}

runTest(createIntegrationTest(new Test()));
