import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";
import {TwingEnvironmentOptions} from "../../../../../src/lib/environment";

export class Test extends TestBase {
    getDescription() {
        return '"include" tag throws an error when passed undefined data';
    }

    getTemplates() {
        return {
            'foo.twig': `FOO`,
            'index.twig': `{% include "foo.twig" with data %}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingRuntimeError: Variable "data" does not exist in "index.twig" at line 1, column 28.';
    }
}

export class StrictVariablesSetToFalse extends Test {
    getDescription(): string {
        return super.getDescription() + ' (strict_variables set to false)';
    }

    getEnvironmentOptions(): TwingEnvironmentOptions {
        return {
            strictVariables: false
        };
    }

    getExpectedErrorMessage() {
        return 'TwingRuntimeError: Variables passed to the "include" function or tag must be iterable, got "null" in "index.twig" at line 1, column 4.';
    }
}

runTest(createIntegrationTest(new Test));
runTest(createIntegrationTest(new StrictVariablesSetToFalse));
