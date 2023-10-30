import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";
import {createEnvironment} from "../../../../../src/lib/environment";
import {TwingLoaderArray} from "../../../../../src";

class Test extends TestBase {
    getDescription() {
        return '"include" function accepts Template instance';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ include(foo) }} FOO`,
            'foo.twig': `
BAR`
        };
    }

    getExpected() {
        return `
BAR FOO
`;
    }

    async getContext() {
        const environment = createEnvironment(
            new TwingLoaderArray({
                'foo.twig': `
BAR`
            })
        );
        
        return environment.loadTemplate('foo.twig')
            .then((template) => {
                return {
                    foo: template
                }
            });
    }
}

runTest(createIntegrationTest(new Test()));
