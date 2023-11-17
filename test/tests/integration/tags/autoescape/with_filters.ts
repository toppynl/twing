import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"autoescape" tag applies escaping after calling filters';
    }

    getTemplates() {
        return {
            'index.twig': `
{% autoescape 'html' %}
8. Escape if last filter is not an escaper
( the output of |format is "<b>" ~ var ~ "</b>",
  |raw is redundant,
  the output is auto-escaped )
{{ "<b>%s</b>"|raw|format(var) }}
{% endautoescape %}`
        };
    }

    getExpected() {
        return `
8. Escape if last filter is not an escaper
( the output of |format is "<b>" ~ var ~ "</b>",
  |raw is redundant,
  the output is auto-escaped )
&lt;b&gt;&lt;Fabien&gt;
Twig&lt;/b&gt;
`;
    }


    getContext() {
        return {
            'var': `<Fabien>\nTwig`
        };
    }
}

runTest(createIntegrationTest(new Test));
