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
        return 'TwingErrorRuntime: Variable `data` does not exist in "index.twig" at line 1.';
    }
}

export class StrictVariablesSetToFalse extends Test {
    getDescription(): string {
        return super.getDescription() + ' (strict_variables set to false)';
    }

    getEnvironmentOptions(): TwingEnvironmentOptions {
        return {
            strict_variables: false
        };
    }

    getExpectedErrorMessage() {
        return 'TwingErrorRuntime: Variables passed to the "include" function or tag must be iterable, got "null" in "index.twig" at line 1.';
    }
}

runTest(createIntegrationTest(new Test));
runTest(createIntegrationTest(new StrictVariablesSetToFalse));
