import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";
import {TwingEnvironmentOptions} from "../../../../src/lib/environment";

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

    getContext() {
        return {
            foobar: 'foobar'
        }
    }

    getExpectedErrorMessage() {
        return 'TwingRuntimeError: Variable `foo2` does not exist in "index.twig" at line 11.';
    }

    getEnvironmentOptions(): TwingEnvironmentOptions {
        return {
            strictVariables: true
        };
    }
}

runTest(createIntegrationTest(new Test));
