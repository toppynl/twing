import {runTest} from "../../TestBase";
import {TwingCache} from "../../../../../src/lib/cache";
import {createSandboxSecurityPolicy} from "../../../../../src/lib/sandbox/security-policy";
import {TwingModuleNode} from "../../../../../src/lib/node/module";

const createCache = (): TwingCache => {
    const container = new Map<string, TwingModuleNode>();

    return {
        generateKey: (hash) => Promise.resolve(hash),
        getTimestamp: () => Promise.resolve(Number.POSITIVE_INFINITY),
        load: (key) => Promise.resolve(container.get(key) || null),
        write: (key, content) => Promise.resolve(container.set(key, content)).then()
    };
};

const cache = createCache();

const testCases: Array<[title: string, Record<string, any>, errorMessage: string]> = [
    ['record', {
        foo: new (class {
            bar() {
                return 'bar';
            }
        })
    }, 'TwingSandboxSecurityError: Calling "bar" method on an instance of (anonymous) is not allowed in "index.twig" at line 1, column 4.']
];

for (const [name, context, errorMessage] of testCases) {
    for (const sandboxed of [false, true]) {
        runTest({
            description: `method call honors the runtime sandbox setting (${sandboxed}) with ${name}`,
            templates: {
                "index.twig": `{{ foo.bar() }}`
            },
            context: Promise.resolve(context),
            trimmedExpectation: sandboxed ? undefined : 'bar',
            expectedErrorMessage: sandboxed ? errorMessage : undefined,
            environmentOptions: {
                cache,
                sandboxed,
                sandboxPolicy: createSandboxSecurityPolicy()
            }
        });
    }
}
