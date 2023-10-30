import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'use an anonymous function as a function';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ anon_foo('bar') }}
{{ 'bar'|anon_foo }}`
        };
    }

    getExpected() {
        return `
*bar*
*bar*
`;
    }
}

runTest(createIntegrationTest(new Test()));
