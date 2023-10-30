import * as tape from 'tape';
import {createNameNode} from "../../../../../../../src/lib/node/expression/name";
import {MockLoader} from "../../../../../../mock/loader";
import {createMockCompiler} from "../../../../../../mock/compiler";
import {MockEnvironment} from "../../../../../../mock/environment";
import {FilesystemEnvironment} from "../../../../../../../src/lib/environment/filesystem-environment";
import {TwingLoaderArray} from "../../../../../../../src/lib/loader/array";

tape('NameNode', ({test}) => {
    test('factory', ({same, end}) => {
        let node = createNameNode('foo', 1, 1);

        same(node.type, 'name');
        same(node.attributes.name, 'foo');
        same(node.attributes.is_defined_test, false);
        same(node.line, 1);
        same(node.column,1);

        end();
    });

    test('clone', ({same, end}) => {
        let node = createNameNode('foo', 1, 1);

        node.attributes.is_defined_test = true;

        const clone = node.clone();

        same(clone.attributes.is_defined_test, true);

        clone.attributes.is_defined_test = false;

        same(node.attributes.is_defined_test, true);

        end();
    });

    test('compile', ({test, same}) => {
        let node = createNameNode('foo', 1, 1);
        let self = createNameNode('_self', 1, 1);
        let context = createNameNode('_context', 1, 1);

        let loader = new MockLoader();
        let compiler = createMockCompiler(new MockEnvironment(loader, {strict_variables: true}));
        let compiler1 = createMockCompiler(new MockEnvironment(loader, {strict_variables: false}));

        same(compiler.compile(node).source, `(context.has(\`foo\`) ? context.get(\`foo\`) : (() => { throw new this.RuntimeError('Variable \`foo\` does not exist.', 1, this.source); })())`);
        same(compiler1.compile(node).source, `(context.has(\`foo\`) ? context.get(\`foo\`) : null)`);
        same(compiler.compile(self).source, `this.templateName`);
        same(compiler.compile(context).source, `context`);

        test('when "is_defined_test" is set to true', ({test}) => {
            test('and name is special', ({same, end}) => {
                let node = createNameNode('_self', 1, 1);

                node.attributes.is_defined_test = true;

                let compiler = createMockCompiler(new FilesystemEnvironment(new TwingLoaderArray({})));

                same(compiler.compile(node).source, `true`);

                end();
            });
        });
    });
});
