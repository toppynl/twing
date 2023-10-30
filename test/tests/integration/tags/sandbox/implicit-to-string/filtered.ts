import TestBase, {runTest} from "../../../TestBase";
import {createIntegrationTest} from "../../../test";
import {TwingEnvironmentOptions} from "../../../../../../src/lib/environment";

class Test extends TestBase {
    getDescription() {
        return '"sandbox" tag checks implicit toString calls when filtered';
    }

    getTemplates() {
        return {
            'foo.twig': `{{ article }}
`,
            'index.twig': `{% sandbox %}
    {% include 'foo.twig' %}
{% endsandbox %}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingSandboxSecurityError: Calling "toString" method on "Article" is not allowed in "foo.twig" at line 2.';
    }

    getSandboxSecurityPolicyFilters() {
        return ['upper'];
    }

    getEnvironmentOptions(): TwingEnvironmentOptions {
        return {
            escapingStrategy: false
        }
    }

    getContext() {
        return {
            article: {
                toString: () => {
                    return 'Article';
                }
            }
        }
    }
}

runTest(createIntegrationTest(new Test));
