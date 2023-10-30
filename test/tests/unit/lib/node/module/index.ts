import * as tape from 'tape';
import {createConstantNode} from "../../../../../../src/lib/node/expression/constant";
import {createTextNode} from "../../../../../../src/lib/node/text";
import {createBaseNode} from "../../../../../../src/lib/node";
import {createModuleNode} from "../../../../../../src/lib/node/module";
import {TwingSource} from "../../../../../../src/lib/source";
import {createMockCompiler} from "../../../../../mock/compiler";
import {createImportNode} from "../../../../../../src/lib/node/import";
import {createAssignNameNode} from "../../../../../../src/lib/node/expression/assign-name";
import {createSetNode} from "../../../../../../src/lib/node/set";
import {createConditionalNode} from "../../../../../../src/lib/node/expression/conditional";
import {MockLoader} from "../../../../../mock/loader";
import {MockEnvironment} from "../../../../../mock/environment";
import {createBodyNode} from "../../../../../../src/lib/node/body";

tape('ModuleNode', ({test}) => {
    test('factory', ({same, end}) => {
        const body = createBodyNode(createBaseNode(null), 1, 1, null);
        const parent = createConstantNode('layout.twig', 1, 1);
        const blocks = createBaseNode(null);
        const macros = createBaseNode(null);
        const traits = createBaseNode(null);
        const source = new TwingSource('{{ foo }}', 'foo.twig');
        const node = createModuleNode(body, parent, blocks, macros, traits, [], source, 1, 1);

        console.log(node.toString());

        same(node.children.body, body);
        same(node.children.blocks, blocks);
        same(node.children.macros, macros);
        same(node.children.parent, parent);
        same(node.templateName, source.getName());
        same(node.type, 'module');
        same(node.line, 1);
        same(node.column, 1);

        end();
    });

    test('compile', ({test}) => {
        let compiler = createMockCompiler();

        test('basic', ({same, end}) => {
            const body = createBodyNode(createTextNode('foo', 1, 1), 1, 1);
            const parent = null;
            const blocks = createBaseNode(null);
            const macros = createBaseNode(null);
            const traits = createBaseNode(null);
            const source = new TwingSource('{{ foo }}', 'foo.twig');
            const node = createModuleNode(body, parent, blocks, macros, traits, [], source, 1, 1);

            same(compiler.compile(node).source, `module.exports = (TwingTemplate) => {
    return new Map([
        [0, class extends TwingTemplate {
            constructor(environment) {
                super(environment);

                this._source = new this.Source(\`\`, \`foo.twig\`);

                let aliases = new this.Context();
                aliases.proxy[\`_self\`] = this.aliases.proxy[\`_self\`] = this;
            }

            async doDisplay(context, outputBuffer, blocks = new Map()) {
                let aliases = this.aliases.clone();

                outputBuffer.echo(\`foo\`);
            }

        }],
    ]);
};`);

            end();
        });

        test('with parent', ({same, end}) => {
            const importNode = createImportNode(
                createConstantNode('foo.twig', 1, 1),
                createAssignNameNode('macro', 1, 1),
                true,
                2, 1
            );
            const body = createBodyNode(createBaseNode(null, {}, {
                0: importNode
            }), 1, 1);
            const extendsNode = createConstantNode('layout.twig', 1, 1);
            const blocks = createBaseNode(null);
            const macros = createBaseNode(null);
            const traits = createBaseNode(null);
            const source = new TwingSource('{{ foo }}', 'foo.twig');

            const node = createModuleNode(body, extendsNode, blocks, macros, traits, [], source, 1, 1);

            same(compiler.compile(node).source, `module.exports = (TwingTemplate) => {
    return new Map([
        [0, class extends TwingTemplate {
            constructor(environment) {
                super(environment);

                this._source = new this.Source(\`\`, \`foo.twig\`);

                let aliases = new this.Context();
                aliases.proxy[\`_self\`] = this.aliases.proxy[\`_self\`] = this;
            }

            doGetParent(context) {
                return this.loadTemplate(\`layout.twig\`, 1).then((parent) => {
                    this.parent = parent;

                    return parent;
                });
            }

            async doDisplay(context, outputBuffer, blocks = new Map()) {
                let aliases = this.aliases.clone();

                aliases.proxy[\`macro\`] = this.aliases.proxy[\`macro\`] = await this.loadTemplate(\`foo.twig\`, 2);
                await (await this.getParent(context)).display(context, this.merge(await this.getBlocks(), blocks), outputBuffer);
            }

            get isTraitable() {
                return false;
            }

        }],
    ]);
};`);

            end();
        });

        test('with conditional parent, set body and debug', ({same, end}) => {
            const set = createSetNode(false, createBaseNode(null, {}, {
                0: createAssignNameNode('foo', 4, 1)
            }), createBaseNode(null, {}, {
                0: createConstantNode('foo', 4, 1)
            }), 4, 1);

            const body = createBodyNode(createBaseNode(null, {}, {
                0: set
            }), 1, 1);

            const extendsNode = createConditionalNode(
                createConstantNode(true, 2, 1),
                createConstantNode('foo', 2, 1),
                createConstantNode('bar', 2, 1),
                2, 1
            );

            const blocks = createBaseNode(null);
            const macros = createBaseNode(null);
            const traits = createBaseNode(null);
            const source = new TwingSource('{{ foo }}', 'foo.twig');

            const loader = new MockLoader();
            const environment = new MockEnvironment(loader, {debug: true});

            const node = createModuleNode(body, extendsNode, blocks, macros, traits, [], source, 1, 1);

            compiler = createMockCompiler(environment);

            same(compiler.compile(node).source, `module.exports = (TwingTemplate) => {
    return new Map([
        [0, class extends TwingTemplate {
            constructor(environment) {
                super(environment);

                this._source = new this.Source(\`{{ foo }}\`, \`foo.twig\`);

                let aliases = new this.Context();
                aliases.proxy[\`_self\`] = this.aliases.proxy[\`_self\`] = this;
            }

            doGetParent(context) {
                return this.loadTemplate(((true) ? (\`foo\`) : (\`bar\`)), 2);
            }

            async doDisplay(context, outputBuffer, blocks = new Map()) {
                let aliases = this.aliases.clone();

                context.proxy[\`foo\`] = \`foo\`;
                await (await this.getParent(context)).display(context, this.merge(await this.getBlocks(), blocks), outputBuffer);
            }

            get isTraitable() {
                return false;
            }

        }],
    ]);
};`);

            end();
        });
    });
});
