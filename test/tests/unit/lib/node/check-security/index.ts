import * as tape from 'tape';
import {createCheckSecurityNode} from "../../../../../../src/lib/node/check-security";
import {createMockCompiler} from "../../../../../mock/compiler";

tape('CheckSecurityNode', ({test}) => {
    test('factory', ({same, end}) => {
        let node = createCheckSecurityNode(new Map([]), new Map([]), new Map([]), 1, 1);

        same(node.type, 'check_security');

        end();
    });

    test('compile', ({same, end}) => {
        let node = createCheckSecurityNode(new Map([['foo', 'bar']]), new Map([['foo', 'bar']]), new Map([['foo', 'bar']]), 1, 1);
        let compiler = createMockCompiler();

        same(compiler.compile(node).source, `let tags = new Map([[\`bar\`, null]]);
let filters = new Map([[\`bar\`, null]]);
let functions = new Map([[\`bar\`, null]]);

try {
    this.environment.checkSecurity(
        [\'bar\'],
        [\'bar\'],
        [\'bar\']
    );
}
catch (e) {
    if (e instanceof this.SandboxSecurityError) {
        e.setSourceContext(this.source);

        if (e instanceof this.SandboxSecurityNotAllowedTagError && tags.has(e.getTagName())) {
            e.setTemplateLine(tags.get(e.getTagName()));
        }
        else if (e instanceof this.SandboxSecurityNotAllowedFilterError && filters.has(e.getFilterName())) {
            e.setTemplateLine(filters.get(e.getFilterName()));
        }
        else if (e instanceof this.SandboxSecurityNotAllowedFunctionError && functions.has(e.getFunctionName())) {
            e.setTemplateLine(functions.get(e.getFunctionName()));
        }
    }

    throw e;
}

`);

        end();
    })
});
