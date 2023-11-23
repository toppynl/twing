import TestBase from "./TestBase";
import {TwingEnvironmentOptions} from "../../../src/lib/environment";
import {MappingItem} from "source-map";
import {TwingParserOptions} from "../../../src/lib/parser";
import {TwingFilter} from "../../../src/lib/filter";
import {TwingFunction} from "../../../src/lib/function";
import {TwingTest} from "../../../src/lib/test";
import {TwingNodeVisitor} from "../../../src/lib/node-visitor";
import {TwingLoader} from "../../../src/lib/loader";
import {TwingSandboxSecurityPolicy} from "../../../src/lib/sandbox/security-policy";

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
    parserOptions?: TwingParserOptions;
    sandboxPolicy?: TwingSandboxSecurityPolicy;
    sandboxSecurityPolicyTags?: Array<string>;
    sandboxSecurityPolicyFilters?: Array<string>;
    sandboxSecurityPolicyFunctions?: Array<string>;
    sandboxSecurityPolicyProperties?: Map<Function, Array<string>>;
    sandboxSecurityPolicyMethods?: Map<Function, Array<string>>;
    trimmedExpectation?: string;
    type?: "template" | "execution context"; // todo: remove when moved to execution context only
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
        type: testInstance.getType()
    };
};

