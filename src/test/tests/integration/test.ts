import TestBase from "./TestBase";
import {TwingEnvironmentOptions} from "../../../main/lib/environment";
import {MappingItem} from "source-map";
import {TwingFilter} from "../../../main/lib/filter";
import {TwingFunction} from "../../../main/lib/function";
import {TwingTest} from "../../../main/lib/test";
import {TwingNodeVisitor} from "../../../main/lib/node-visitor";
import {TwingLoader} from "../../../main/lib/loader";
import {TwingSandboxSecurityPolicy} from "../../../main/lib/sandbox/security-policy";

export type IntegrationTest = {
    additionalFilters?: Array<TwingFilter>;
    additionalFunctions?: Array<TwingFunction>;
    additionalNodeVisitors?: Array<TwingNodeVisitor>;
    additionalTests?: Array<TwingTest>;
    context?: Record<string, any> | Promise<Record<string, any>>;
    description: string;
    environmentOptions?: TwingEnvironmentOptions;
    expectedErrorMessage?: string | null;
    expectedDeprecationMessages?: Array<string> | null;
    expectedSourceMapMappings?: Array<MappingItem>;
    expectation?: string;
    globals?: Record<string, any>;
    sandboxed?: boolean;
    sandboxPolicy?: TwingSandboxSecurityPolicy;
    sandboxSecurityPolicyTags?: Array<string>;
    sandboxSecurityPolicyFilters?: Array<string>;
    sandboxSecurityPolicyFunctions?: Array<string>;
    sandboxSecurityPolicyProperties?: Map<Function, Array<string>>;
    sandboxSecurityPolicyMethods?: Map<Function, Array<string>>;
    strict?: boolean;
    trimmedExpectation?: string;
} & ({
    templates: {
        'index.twig': string;
    } & Record<string, string>;
} | {
    loader: TwingLoader;
})

export const createIntegrationTest = (
    testInstance: TestBase
): IntegrationTest => {
    return {
        description: testInstance.getDescription(),
        context: Promise.resolve(testInstance.getContext()),
        trimmedExpectation: testInstance.getExpected(),
        templates: testInstance.getTemplates() as any,
        expectedErrorMessage: testInstance.getExpectedErrorMessage(),
        environmentOptions: testInstance.getEnvironmentOptions(),
        globals: testInstance.getGlobals(),
        sandboxSecurityPolicyTags: testInstance.getSandboxSecurityPolicyTags(),
        sandboxSecurityPolicyFilters: testInstance.getSandboxSecurityPolicyFilters(),
        sandboxSecurityPolicyFunctions: testInstance.getSandboxSecurityPolicyFunctions(),
        expectedDeprecationMessages: testInstance.getExpectedDeprecationMessages(),
        strict: testInstance.getStrict()
    };
};

