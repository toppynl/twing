import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"autoescape" tag applies escaping after calling filters';
    }

    getTemplates() {
        return {
            'index.twig': `
{% set var %}<Fabien>
Twig{% endset %}
{% autoescape 'html' %}
{{ "<b>%s</b>"|raw }}
{{ "<b>%s</b>"|raw|format(var) }}
{{ "<b>%s</b>"|raw|format(var)|raw }}
{% endautoescape %}`
        };
    }

    getExpected() {
        return `
<b>%s</b>
&lt;b&gt;&lt;Fabien&gt;
Twig&lt;/b&gt;
<b><Fabien>
Twig</b>
`;
    }
}

runTest(createIntegrationTest(new Test));
