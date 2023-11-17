import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Exception for multiline array with undefined variable';
    }

    getTemplates() {
        return {
            'index.twig': `
{% set foo = {
   foo: 'foo',
   bar: 'bar',


   foobar: foobar,



   foo2: foo2,
} %}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingRuntimeError: Variable "foobar" does not exist in "index.twig" at line 7.';
    }
}

runTest(createIntegrationTest(new Test));
