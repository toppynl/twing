import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getTemplates() {
        return {
            'foo.twig': `
`,
            'index.twig': `
{% block content %}
    CONTENT
    {%- block subcontent -%}
        SUBCONTENT
    {%- endblock -%}
    ENDCONTENT
{% endblock %}`
        };
    }

    getExpected() {
        return `
CONTENTSUBCONTENTENDCONTENT
`;
    }

}

runTest(createIntegrationTest(new Test));
