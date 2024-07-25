import {runTest} from "../../TestBase";
import {createEnvironment} from "../../../../../main/lib/environment";
import {createArrayLoader} from "../../../../../main/lib/loader/array";

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
    expectation: `

BAR FOO`
}));

