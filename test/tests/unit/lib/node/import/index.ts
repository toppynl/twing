import * as tape from 'tape';
import {createConstantNode} from "../../../../../../src/lib/node/expression/constant";
import {createAssignNameNode} from "../../../../../../src/lib/node/expression/assign-name";
import {createImportNode} from "../../../../../../src/lib/node/import";
import {createMockCompiler} from "../../../../../mock/compiler";

tape('node/import', ({test}) => {
    test('factory', ({same, end}) => {
        let macro = createConstantNode('foo.twig', 1, 1);
        let var_ = createAssignNameNode('macro', 1, 1);
        let node = createImportNode(macro, var_, false, 1, 1);

        same(node.attributes.global, false);
        same(node.children.expr, macro);
        same(node.children.var, var_);
        same(node.type, 'import');
        same(node.line, 1);
        same(node.column, 1);

        end();
    });

    test('compile', ({test}) => {
        test('with global set to false', ({same, end}) => {
            let macro = createConstantNode('foo.twig', 1, 1);
            let var_ = createAssignNameNode('macro', 1, 1);
            let node = createImportNode(macro, var_, false, 1, 1);
            let compiler = createMockCompiler();

            same(compiler.compile(node).source, `aliases.proxy[\`macro\`] = await this.loadTemplate(\`foo.twig\`, 1);
`);

            end();
        });

        test('with global set to true', ({same, end}) => {
            let macro = createConstantNode('foo.twig', 1, 1);
            let var_ = createAssignNameNode('macro', 1, 1);
            let node = createImportNode(macro, var_, true, 1, 1);
            let compiler = createMockCompiler();

            same(compiler.compile(node).source, `aliases.proxy[\`macro\`] = this.aliases.proxy[\`macro\`] = await this.loadTemplate(\`foo.twig\`, 1);
`);

            end();
        });
    });
});
