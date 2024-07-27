import {runTest} from "../../TestBase";
import {createEnvironment, createSynchronousEnvironment} from "../../../../../main/lib/environment";
import {createArrayLoader, createSynchronousArrayLoader} from "../../../../../main/lib/loader/array";

runTest(({
    description: '"include" tag with a template instance',
    templates: {
        'foo.twig': `
BAR`,
        'index.twig': `
{% include foo %} FOO`
    },
    context: new Promise((resolve) => {
        const environment = createEnvironment(
            createArrayLoader({
                'foo.twig': `
BAR`
            })
        )

        resolve(environment.loadTemplate('foo.twig')
            .then((template) => {
                return {
                    foo: template
                };
            })
        );
    }),
    synchronousContext: {
        foo: createSynchronousEnvironment(
            createSynchronousArrayLoader({
                'foo.twig': `
BAR`
            })
        ).loadTemplate('foo.twig')
    },
    trimmedExpectation: `BAR FOO
`
}));

runTest(({
    description: '"include" tag with a template instance',
    templates: {
        'foo.twig': `
BAR`,
        'index.twig': `
{% include foo %} FOO`
    },
    context: new Promise((resolve) => {
        const environment = createEnvironment(
            createArrayLoader({
                'foo.twig': `
BAR`
            })
        )

        resolve(environment.loadTemplate('foo.twig')
            .then((template) => {
                return {
                    foo: template
                };
            }));
    }),
    synchronousContext: {
        foo: createSynchronousEnvironment(
            createSynchronousArrayLoader({
                'foo.twig': `
BAR`
            })
        ).loadTemplate('foo.twig')
    },
    expectation: `

BAR FOO`
}));

