import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";
import {TwingEnvironmentOptions} from "../../../../../src/lib/environment";

export class Test extends TestBase {
    getDescription() {
        return '"include" tag throws an error when passed string data';
    }

    getTemplates() {
        return {
            'foo.twig': `FOO`,
            'index.twig': `{% include "foo.twig" with "bar" %}`
        };
    }

    getEnvironmentOptions(): TwingEnvironmentOptions {
        return {
            strictVariables: false
        };
    }

    getExpectedErrorMessage() {
        return 'TwingRuntimeError: Variables passed to the "include" function or tag must be iterable, got "string" in "index.twig" at line 1, column 4.';
    }
}

runTest(createIntegrationTest(new Test));
