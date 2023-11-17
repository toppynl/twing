import TestBase, {runTest} from "../../TestBase";
import {createMarkup} from "../../../../../src/lib/markup";
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
            autoEscapingStrategy: "html"
        }
    }

    getContext() {
        return {
            markup: createMarkup('Foo', 'utf-8')
        }
    }
}

runTest(createIntegrationTest(new Test));
