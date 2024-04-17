import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Filters as static method calls';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ 'foo'|static_call_string }}
{{ 'foo'|static_call_array }}`
        };
    }

    getExpected() {
        return `
*foo*
*foo*
`;
    }

    getContext() {
        return {
            foo: 'foo'
        }
    }
}

runTest(createIntegrationTest(new Test()));
