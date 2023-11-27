import TestBase, {runTest} from "../../../TestBase";
import {createIntegrationTest} from "../../../test";

export class Basic extends TestBase {
    getDescription() {
        return '"sandbox" tag checks implicit toString calls when using concatenation';
    }

    getTemplates() {
        return {
            'foo.twig': `{{ article ~ article }}
`,
            'index.twig': `{% sandbox %}
    {% include 'foo.twig' %}
{% endsandbox %}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingSandboxSecurityError: Calling "toString" method on an instance of Object is not allowed in "foo.twig" at line 2, column 8.';
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

export class Set extends Basic {
    getDescription() {
        return '"sandbox" tag checks implicit toString calls when using concatenation with the "set" tag';
    }

    getTemplates() {
        return {
            'index.twig': `
{% sandbox %}
    {% include "foo.twig" %}
{% endsandbox %}
`,
            'foo.twig': `
{% set a = article ~ article %}
`
        };
    }

    getExpectedErrorMessage(): string {
        return 'TwingSandboxSecurityError: Calling "toString" method on an instance of Object is not allowed in "foo.twig" at line 3, column 8.';
    }

    getSandboxSecurityPolicyTags(): string[] {
        return [
            'set'
        ];
    }
}

runTest(createIntegrationTest(new Basic()));
runTest(createIntegrationTest(new Set()));
