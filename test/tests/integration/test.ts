import TestBase from "./TestBase";
import {TwingEnvironmentOptions} from "../../../src/lib/environment";

export type IntegrationTest = {
    description: string;
    templates: Record<string, string>;
    expectation: string;
    context: Record<string, any> | Promise<Record<string, any>>;
    environmentOptions?: TwingEnvironmentOptions;
    globals?: Record<string, any>;
    expectedErrorMessage?: string;
    expectedDeprecationMessages?: Array<string>;
    sandboxSecurityPolicyTags?: Array<string>;
    sandboxSecurityPolicyFilters?: Array<string>;
    sandboxSecurityPolicyFunctions?: Array<string>;
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

