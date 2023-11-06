import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";
import {createEnvironment} from "../../../../../src/lib/environment";
import {createArrayLoader} from "../../../../../src/lib/loader/array";

class Test extends TestBase {
    getTemplates() {
        return {
            'foo.twig': `
BAR`,
            'index.twig': `
{% include foo %} FOO`
        };
    }

    async getContext() {
        const environment = createEnvironment(
            createArrayLoader({
                'foo.twig': `
BAR`
            })
        )

        return environment.loadTemplate('foo.twig')
            .then((template) => {
                return {
                    foo: template
                };
            });
    }

    getExpected() {
        return `BAR FOO
`;
    }

}

runTest(createIntegrationTest(new Test));
