import TestBase, {runTest} from "../../TestBase";
import {TwingMarkup} from "../../../../../src/lib/markup";
import {createIntegrationTest} from "../../test";
import {TwingEnvironmentOptions} from "../../../../../src/lib/environment";

class Test extends TestBase {
    getDescription() {
        return '"sandbox" tag ignore TwingMarkup';
    }

    getTemplates() {
        return {
            'foo.twig': `{{ markup }}
`,
            'index.twig': `{% sandbox %}
    {% include 'foo.twig' %}
{% endsandbox %}`
        };
    }

    getExpected() {
        return `Foo
`;
    }

    getEnvironmentOptions(): TwingEnvironmentOptions {
        return {
            escapingStrategy: false
        }
    }

    getContext() {
        return {
            markup: new TwingMarkup('Foo', 'utf-8')
        }
    }
}

runTest(createIntegrationTest(new Test));
