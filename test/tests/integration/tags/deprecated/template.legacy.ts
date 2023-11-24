import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return 'Deprecating a template with "deprecated" tag';
    }

    getTemplates() {
        return {
            'index.twig': `{% extends 'greeting.twig' %}

{% deprecated 'The "index.twig" template is deprecated, use "greeting.twig" instead.' %}
`,
            'greeting.twig': `Hello Fabien
`
        };
    }

    getExpected() {
        return `Hello Fabien
`;
    }

    getExpectedDeprecationMessages() {
        return [
            'The "index.twig" template is deprecated, use "greeting.twig" instead. ("index.twig" at line 3, column 4)'
        ];
    }
}

runTest(createIntegrationTest(new Test));
