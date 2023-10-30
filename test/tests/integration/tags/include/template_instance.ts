import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";
import {createEnvironment} from "../../../../../src/lib/environment";
import {TwingLoaderArray} from "../../../../../src";

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
            new TwingLoaderArray({
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
