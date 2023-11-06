import TestBase from "./TestBase";
import {TwingEnvironmentOptions} from "../../../src/lib/environment";
import {MappingItem} from "source-map";
import {TwingParserOptions} from "../../../src/lib/parser";
import {TwingFilter} from "../../../src/lib/filter";
import {TwingFunction} from "../../../src/lib/function";
import {TwingTest} from "../../../src/lib/test";

export type IntegrationTest = {
    additionalFilters?: Array<TwingFilter>;
    additionalFunctions?: Array<TwingFunction>;
    additionalTests?: Array<TwingTest>;
    context?: Record<string, any> | Promise<Record<string, any>>;
    description: string;
    environmentOptions?: TwingEnvironmentOptions;
    expectation?: string;
    expectedErrorMessage?: string | null;
    expectedDeprecationMessages?: Array<string> | null;
    expectedSourceMapMappings?: Array<MappingItem>;
    globals?: Record<string, any>;
    parserOptions?: TwingParserOptions;
    sandboxSecurityPolicyTags?: Array<string>;
    sandboxSecurityPolicyFilters?: Array<string>;
    sandboxSecurityPolicyFunctions?: Array<string>;
    templates: Record<string, string>;
};

export const createIntegrationTest = (
    testInstance: TestBase
): IntegrationTest => {
    return {
        description: testInstance.getDescription(),
        context: Promise.resolve(testInstance.getContext()),
        expectation: testInstance.getExpected(),
        templates: testInstance.getTemplates(),
        expectedErrorMessage: testInstance.getExpectedErrorMessage(),
        environmentOptions: testInstance.getEnvironmentOptions(),
        globals: testInstance.getGlobals(),
        sandboxSecurityPolicyTags: testInstance.getSandboxSecurityPolicyTags(),
        sandboxSecurityPolicyFilters: testInstance.getSandboxSecurityPolicyFilters(),
        sandboxSecurityPolicyFunctions: testInstance.getSandboxSecurityPolicyFunctions(),
        expectedDeprecationMessages: testInstance.getExpectedDeprecationMessages()
    };
};

