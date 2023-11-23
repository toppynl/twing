import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getName() {
        return 'tags/spaceless/simple';
    }

    getDescription() {
        return '"spaceless" tag removes whites between HTML tags';
    }

    getTemplates() {
        return {
            'index.twig': `
{% spaceless %}

    <div>   <div>   foo   </div>   </div>

{% endspaceless %}`
        };
    }

    getExpected() {
        return `
<div><div>   foo   </div></div>
`;
    }


    getExpectedDeprecationMessages() {
        return [
            'The "spaceless" tag in "index.twig" at line 2 is deprecated since Twig 2.7, use the "spaceless" filter instead.'
        ];
    }
    
    getType(): "template" | "execution context" | undefined {
        return "execution context";
    }
}

runTest(createIntegrationTest(new Test));
