import {BaseNode, BaseNodeAttributes, createBaseNode, getChildren, getChildrenCount} from "../node";
import type {Source} from "../source";
import {TwingCompiler} from "../compiler";
import {BaseExpressionNode} from "./expression";
import {BodyNode, createBodyNode} from "./body";
import {TraitNode} from "./trait";
import {MacroNode} from "./macro";

export type ModuleNodeAttributes = BaseNodeAttributes & {
    index: number;
    embedded_templates: Array<ModuleNode>;
    templateName: string;
};

export type ModuleNodeChildren = {
    body: BodyNode;
    blocks: BaseNode<any, {}, Record<string, BodyNode>>;
    macros: BaseNode<any, {}, Record<string, MacroNode>>;
    traits: BaseNode<any, {}, Record<string, TraitNode>>;
    factory_end?: BaseNode;
    parent?: BaseExpressionNode;
};

export interface ModuleNode extends BaseNode<"module", ModuleNodeAttributes, ModuleNodeChildren> {
}

export const createModuleNode = (
    body: ModuleNode["children"]["body"],
    parent: BaseExpressionNode | null,
    blocks: ModuleNode["children"]["blocks"],
    macros: ModuleNode["children"]["macros"],
    traits: ModuleNode["children"]["traits"],
    embeddedTemplates: Array<ModuleNode>,
    source: Source,
    line: number,
    column: number
): ModuleNode => {
    const children: ModuleNode["children"] = {
        body,
        blocks,
        macros,
        traits
    };

    if (parent !== null) {
        children.parent = parent;
    }

    const baseNode = createBaseNode("module", {
        index: 0,
        embedded_templates: embeddedTemplates,
        templateName: source.name
    }, children, line, column);
    
    const compileClassHeader = (compiler: TwingCompiler) => {
        let index = baseNode.attributes.index;

        compiler
            .write(`${index}: (runtime) => {\n`)
            .indent();
    };

    const compileFactory = (compiler: TwingCompiler) => {
        const {blocks, macros} = baseNode.children;

        compiler
            .write('const aliases = runtime.createContext();\n')
            .write('const baseTemplate = runtime.createBaseTemplate(\n')
            .indent()
            .write('runtime,\n');

        // source
        compiler
            .write('runtime.createSource(')
            .string(source.resolvedName)
            .raw(', ')
            .string(source.code)
            .raw("), // source\n")

        // block handlers
        compiler
            .write('new Map([ // block handlers\n')
            .indent();

        let blockCount = getChildrenCount(blocks);

        for (const [name, node] of Object.entries(blocks.children)) {
            blockCount--;

            compiler.write(`['${name}', `)
                .subCompile(node)
                .raw(']');

            if (blockCount > 0) {
                compiler.raw(',')
            }

            compiler.raw('\n');
        }

        compiler
            .outdent()
            .write(']),\n');

        // macro handlers
        compiler
            .write('new Map([ // macro handlers\n')
            .indent();

        let macroCount = getChildrenCount(macros);

        for (const [name, node] of Object.entries(macros.children)) {
            macroCount--;

            compiler.write(`['${name}', `)
                .subCompile(node)
                .raw(']');

            if (macroCount > 0) {
                compiler.raw(',')
            }

            compiler.raw('\n');
        }

        compiler
            .outdent()
            .write(']),\n');

        // end factory call
        compiler
            .outdent()
            .write(');\n\n')

        compiler
            .write('const template = Object.assign(baseTemplate, {\n')
            .indent();
    }

    const compileDoGetTraits = (compiler: TwingCompiler) => {
        const {traits} = baseNode.children;

        let count = getChildrenCount(traits);

        if (count > 0) {
            compiler
                .write("async doGetTraits() {\n")
                .indent()
                .write('let traits = new Map();\n\n');

            for (let [i, trait] of getChildren(traits)) {
                const {template, targets} = trait.children;

                compiler
                    .write(`let trait_${i} = await template.loadTemplate(`)
                    .subCompile(template)
                    .raw(', ')
                    .render(template.line)
                    .raw(");\n\n")
                ;

                compiler
                    .write(`if (!trait_${i}.isTraitable) {\n`)
                    .indent()
                    .write('throw new runtime.Error(\'Template ')
                    .subCompile(template)
                    .raw(' cannot be used as a trait.\', ')
                    .render(template.line)
                    .raw(", template.source);\n")
                    .outdent()
                    .write('}\n\n')
                    .write(`let traits_${i} = runtime.cloneMap(await trait_${i}.getBlocks());\n\n`)
                ;

                for (let [key, target] of getChildren(targets)) {
                    compiler
                        .write(`if (!traits_${i}.has(`)
                        .string(key)
                        .raw(")) {\n")
                        .indent()
                        .write('throw new runtime.Error(\'Block ')
                        .string(key as string)
                        .raw(' is not defined in trait ')
                        .subCompile(template)
                        .raw('.\', ')
                        .render(target.line)
                        .raw(', template.source);\n')
                        .outdent()
                        .write('}\n\n')
                        .write(`traits_${i}.set(`)
                        .subCompile(target)
                        .raw(`, traits_${i}.get(`)
                        .string(key)
                        .raw(`)); traits_${i}.delete(`)
                        .string(key)
                        .raw(');\n\n')
                    ;
                }
            }

            for (let i = 0; i < count; ++i) {
                compiler.write(`traits = runtime.merge(traits, traits_${i});\n`);
            }

            compiler.write('\n');

            compiler
                .write('return Promise.resolve(traits);\n')
                .outdent()
                .write('},\n');
        }
    }

    const compileDoGetParent = (compiler: TwingCompiler) => {
        const {parent} = baseNode.children;

        if (parent) {
            compiler
                .write("doGetParent: (context) => {\n")
                .indent()
                .write('return template.loadTemplate(')
                .subCompile(parent)
                .raw(', ')
                .render(parent.line)
                .raw(")")
            ;

            // if the parent name is not dynamic, then we can cache the parent as it will never change
            if (parent.type === "constant") {
                compiler
                    .raw('.then((parent) => {\n')
                    .indent()
                    .write('template.parent = parent;\n\n')
                    .write('return parent;\n')
                    .outdent()
                    .write('})')
            }

            compiler
                .raw(';\n')
                .outdent()
                .write("},\n")
            ;
        }
    }

    const compileDoDisplay = (compiler: TwingCompiler) => {
        const {body, parent} = baseNode.children;

        compiler
            .write("doDisplay: async(context, outputBuffer, blocks = new Map()) => {\n")
            .indent()
            .write('const aliases = template.aliases.clone();\n\n')
            .addSourceMapEnter(moduleNode);
        
        compiler.subCompile(body);

        if (parent) {
            compiler.write('await (await template.getParent(context)).display(context, runtime.merge(await template.getBlocks(), blocks), outputBuffer);\n');
        }
        
        compiler.addSourceMapLeave()
            .outdent()
            .write("},\n")
        ;
    }

    const compileIsTraitable = (compiler: TwingCompiler) => {
        const {macros, body, parent} = baseNode.children;

        // A template can be used as a trait if:
        //   * it has no parent
        //   * it has no macros
        //   * it has no body
        //
        // Put another way, a template can be used as a trait if it
        // only contains blocks and use statements.
        let traitable = (parent === undefined) && (getChildrenCount(macros) === 0);

        if (traitable) {
            let node: BaseNode = body.children.content;

            if (getChildrenCount(node) === 0) {
                node = createBodyNode(node, line, column);
            }

            for (let [, subNode] of Object.entries(node.children)) {
                if (getChildrenCount(subNode) === 0) {
                    continue;
                }

                traitable = false;

                break;
            }
        }

        compiler
            .write("get isTraitable() {\n")
            .indent()
            .write(`return ${traitable ? 'true' : 'false'};\n`)
            .outdent()
            .write("}\n")
        ;
    }

    const compileFactoryFooter = (compiler: TwingCompiler) => {
        const {factory_end} = moduleNode.children;

        compiler
            .outdent()
            .write('});\n\n')
            .write('aliases.proxy[`_self`] = template.aliases.proxy[`_self`] = template;\n\n')
        ;
        
        if (factory_end) {
            compiler.subCompile(factory_end);
        }

        compiler
            .write('return template;\n');
        
        compiler
            .outdent()
            .write(`},\n`)
    }

    const compileTemplate = (compiler: TwingCompiler) => {
        compileClassHeader(compiler);
        compileFactory(compiler);
        compileDoGetParent(compiler);
        compileDoGetTraits(compiler);
        compileDoDisplay(compiler);
        compileIsTraitable(compiler);
        compileFactoryFooter(compiler);
    };

    const moduleNode: ModuleNode = {
        ...baseNode,
        compile: (compiler) => {
            let index = baseNode.attributes.index;

            if (index === 0) {
                compiler
                    .write('module.exports = {\n')
                    .indent()
                ;
            }

            compileTemplate(compiler);

            for (const template of baseNode.attributes.embedded_templates) {
                compiler.subCompile(template);
            }

            if (index === 0) {
                compiler
                    .outdent()
                    .write('};\n')
                ;
            }
        }
    };
    
    return moduleNode;
};
