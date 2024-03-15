import {runTest} from "../TestBase";
import {createSandboxSecurityPolicy} from "../../../../src/lib/sandbox/security-policy";

runTest({
    description: 'Sandboxing when disabled',
    templates: {
        "index.twig": `{% do 5 %}{{ foo }}`
    },
    context: Promise.resolve({
        foo: {
            toString: () => 'foo'
        }
    }),
    expectedErrorMessage: `TwingSandboxSecurityError: Tag "do" is not allowed in "index.twig" at line 1, column 4.`,
    sandboxed: true,
    sandboxPolicy: createSandboxSecurityPolicy()
})
