import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"spaceless" filter';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ "    <div>   <div>   foo   </div>   </div>"|spaceless }}
`
        };
    }

    getExpected() {
        return `
<div><div>   foo   </div></div>
`;
    }
}

runTest(createIntegrationTest(new Test()));
