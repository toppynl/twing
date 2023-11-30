import TestBase, {runTest} from "../../../TestBase";
import {createIntegrationTest} from "../../../test";

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
        return 'TwingSandboxSecurityError: Calling "toString" method on an instance of Object is not allowed in "foo.twig" at line 1, column 4.';
    }

    getSandboxSecurityPolicyFilters() {
        return ['upper'];
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
