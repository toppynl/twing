import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";
import {TwingEnvironmentOptions} from "../../../../src/lib/environment";

export class Test extends TestBase {
    getDescription() {
        return '"defined" support for attribute';
    }

    getTemplates() {
        return {
            'index.twig': ``
        };
    }

    getExpected() {
        return ``;
    }

    getContext() {
        return {
            nested: {
                definedVar: 'defined',
            },
            definedVarName: 'definedVar',
            undefinedVarName: 'undefinedVar'
        };
    }
}

export class StrictVariablesSetToFalse extends Test {
    getDescription(): string {
        return super.getDescription() + ' (strict_variables set to false)';
    }

    getEnvironmentOptions(): TwingEnvironmentOptions {
        return {
            strict_variables: false
        }
    }
}

runTest(createIntegrationTest(new Test));
