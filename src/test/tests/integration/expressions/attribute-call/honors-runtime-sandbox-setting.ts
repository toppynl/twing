import {runTest} from "../../TestBase";
import {TwingCache} from "../../../../../main/lib/cache";
import {createSandboxSecurityPolicy} from "../../../../../main/lib/sandbox/security-policy";
import {TwingTemplateNode} from "../../../../../main/lib/node/template";

const createCache = (): TwingCache => {
    const container = new Map<string, TwingTemplateNode>();

    return {
        getTimestamp: () => Promise.resolve(Number.POSITIVE_INFINITY),
        load: (key) => Promise.resolve(container.get(key) || null),
        write: (key, content) => Promise.resolve(container.set(key, content)).then()
    };
};

const cache = createCache();

const testCases: Array<[title: string, Record<string, any>, errorMessage: string]> = [
    ['record', {
        foo: new (class {
            get bar() {
                return 'bar';
            }
        })
    }, 'TwingRuntimeError: Calling "bar" property on an instance of (anonymous) is not allowed in "index.twig" at line 1, column 4.']
];

for (const [name, context, errorMessage] of testCases) {
    for (const sandboxed of [false, true]) {
        runTest({
            description: `attribute call honors the runtime sandbox setting (${sandboxed}) with ${name}`,
            templates: {
                "index.twig": `{{ foo.bar }}`
            },
            context: Promise.resolve(context),
            trimmedExpectation: sandboxed ? undefined : 'bar',
            expectedErrorMessage: sandboxed ? errorMessage : undefined,
            sandboxed,
            environmentOptions: {
                cache,
                sandboxPolicy: createSandboxSecurityPolicy()
            }
        });
    }
}
