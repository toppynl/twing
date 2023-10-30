import TestBase, {runTest} from "../../../TestBase";
import {createIntegrationTest} from "../../../test";

class Test extends TestBase {
    getDescription() {
        return '"for" tag can use an "else" clause with empty items';
    }

    getTemplates() {
        return {
            'index.twig': `{% for item in items %}
    * {{ item }}
{% else %}
    no item
{% endfor %}`
        }
    }

    getEnvironmentOptions() {
        return {
            strict_variables: false
        }
    }

    getContext() {
        let items: any[] = [];

        return {
            items: items
        };
    }

    getExpected() {
        return `
  no item`;
    }

}

runTest(createIntegrationTest(new Test));
