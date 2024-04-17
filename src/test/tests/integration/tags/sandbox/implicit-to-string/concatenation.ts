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
        return 'TwingRuntimeError: Calling "toString" method on an instance of Object is not allowed in "foo.twig" at line 1, column 4.';
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
        return 'TwingRuntimeError: Calling "toString" method on an instance of Object is not allowed in "foo.twig" at line 2, column 12.';
    }

    getSandboxSecurityPolicyTags(): string[] {
        return [
            'set'
        ];
    }
}

runTest(createIntegrationTest(new Basic()));
runTest(createIntegrationTest(new Set()));
