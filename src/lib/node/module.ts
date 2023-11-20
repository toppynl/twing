import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode, getChildren, getChildrenCount} from "../node";
import type {TwingSource} from "../source";
import {TwingCompiler} from "../compiler";
import {TwingBaseExpressionNode} from "./expression";
import {TwingTraitNode} from "./trait";
import {TwingMacroNode} from "./macro";
import {TwingBlockNode} from "./block";
import {createBodyNode, TwingBodyNode} from "./body";

export type TwingModuleNodeAttributes = TwingBaseNodeAttributes & {
    index: number;
    embedded_templates: Array<TwingModuleNode>;
    templateName: string;
};

export type TwingModuleNodeChildren = {
    body: TwingBodyNode;
    blocks: TwingBaseNode<any, {}, Record<string, TwingBlockNode>>;
    macros: TwingBaseNode<any, {}, Record<string, TwingMacroNode>>;
    traits: TwingBaseNode<any, {}, Record<string, TwingTraitNode>>;
    securityCheck: TwingBaseNode;
    parent?: TwingBaseExpressionNode;
};

export interface TwingModuleNode extends TwingBaseNode<"module", TwingModuleNodeAttributes, TwingModuleNodeChildren> {
}

export const createModuleNode = (
    body: TwingModuleNode["children"]["body"],
    parent: TwingBaseExpressionNode | null,
    blocks: TwingModuleNode["children"]["blocks"],
    macros: TwingModuleNode["children"]["macros"],
    traits: TwingModuleNode["children"]["traits"],
    embeddedTemplates: Array<TwingModuleNode>,
    source: TwingSource,
    line: number,
    column: number
): TwingModuleNode => {
    const children: TwingModuleNode["children"] = {
        body,
        blocks,
        macros,
        traits,
        securityCheck: createBaseNode(null)
    };

    if (parent !== null) {
        children.parent = parent;
    }

    const baseNode = createBaseNode("module", {
        index: 0,
        embedded_templates: embeddedTemplates,
        templateName: source.name
    }, children, line, column);

    const compileFactoryHeader = (compiler: TwingCompiler) => {
        let index = baseNode.attributes.index;

        compiler
            .write(`/**\n`)
            .write(` * @param {Runtime} runtime\n`)
            .write(` */\n`)
            .write(`${index}: (runtime) => {\n`)
        ;

        compiler
            .write('const source = runtime.createSource(\n')
            .string(source.resolvedName).write(', ').write('\n')
            .string(source.code).write('\n')
            .write(");\n\n")

        // block handlers
        compiler
            .write('/** @type {Map<string, TemplateBlockHandler>} */\n')
            .write('const blockHandlers = new Map([\n')
        ;

        let blockCount = getChildrenCount(blocks);

        for (const [name, node] of Object.entries(blocks.children)) {
            blockCount--;

            compiler
                .write(`['${name}', `)
                .subCompile(node)
                .write(']');

            if (blockCount > 0) {
                compiler.write(',')
            }

            compiler.write('\n');
        }

        compiler.write(']);\n\n');

        // macro handlers
        compiler
            .write('/** @type {Map<string, TemplateMacroHandler>} */\n')
            .write('const macroHandlers = new Map([\n');

        let macroCount = getChildrenCount(macros);

        for (const [name, node] of Object.entries(macros.children)) {
            macroCount--;

            compiler.write(`['${name}', `)
                .subCompile(node)
                .write(']');

            if (macroCount > 0) {
                compiler.write(',')
            }

            compiler.write('\n');
        }

        compiler.write(']);\n\n');
    };
    
    const compileTemplateInstantiation = (compiler: TwingCompiler) => {
        compiler
            .write('const template = runtime.createTemplate(\n')
            .write('runtime,\n')
            .write('source,\n')
            .write('blockHandlers,\n')
            .write('macroHandlers,\n')
            .write('display,\n')
            .write('getParent,\n')
            .write('getTraits,\n')
            .write('canBeUsedAsATrait\n')
            .write(');\n\n');
        
        compiler
            .write('const aliases = runtime.createContext();\n\n')
            .write('aliases.proxy[`_self`] = template.aliases.proxy[`_self`] = template;\n\n')
        ;

        const {securityCheck} = moduleNode.children;
        
        compiler.subCompile(securityCheck);
    }

    const compileCanBeUsedAsATrait = (compiler: TwingCompiler) => {
        const {macros, body, parent} = baseNode.children;

        // A template can be used as a trait if:
        //   * it has no parent
        //   * it has no macros
        //   * it has no body
        //
        // Put another way, a template can be used as a trait if it
        // only contains blocks and use statements.
        let canBeUsedAsATrait = (parent === undefined) && (getChildrenCount(macros) === 0);

        if (canBeUsedAsATrait) {
            let node: TwingBaseNode = body.children.content;

            if (getChildrenCount(node) === 0) {
                node = createBodyNode(node, line, column);
            }
            
            for (const [, child] of Object.entries(node.children)) {
                if (getChildrenCount(child) === 0) {
                    continue;
                }

                canBeUsedAsATrait = false;

                break;
            }
        }

        compiler
            .write(`const canBeUsedAsATrait = ${canBeUsedAsATrait ? 'true' : 'false'};\n\n`)
        ;
    }

    const compileDisplay = (compiler: TwingCompiler) => {
        const {body, parent} = baseNode.children;

        compiler
            .write('/**').write('\n')
            .write(' * @param {TwingContext} context').write('\n')
            .write(' * @param {TwingOutputBuffer} outputBuffer').write('\n')
            .write(' * @param {TemplateBlocksMap} blocks').write('\n')
            .write(' * @param {TwingSourceMapRuntime} sourceMapRuntime').write('\n')
            .write(' */').write('\n')
            .write("const display = async(context, outputBuffer, blocks, sourceMapRuntime) => {\n")
            .write('const aliases = template.aliases.clone();\n\n')
            .addSourceMapEnter(moduleNode)
        ;

        compiler
            .subCompile(body);

        if (parent) {
            compiler.write(`const displayParent = () => {
    return Promise.all([
        template.getParent(context),
        template.getBlocks()
    ]).then(([parent, ownBlocks]) => {
        return new Promise((resolve, reject) => {
            const stream = parent.display(context, runtime.merge(ownBlocks, blocks), outputBuffer, sourceMapRuntime)
        
            let data = '';
            
            stream.on("error", (error) => {
                reject(error);
            });
            
            stream.on("data", (chunk, encoding, next) => {
                data += chunk.toString();
                
                next();
            });
            
            stream.on("end", () => {
                resolve(data);
            });
        });
    });
};\n\n`);
            
            compiler.write('await displayParent();\n');
        }

        compiler
            .addSourceMapLeave()
            .write("};\n\n")
        ;
    }

    const compileGetParent = (compiler: TwingCompiler) => {
        const {parent} = baseNode.children;

        // parent variable
        compiler
            .write('/** @type {TwingTemplate | null} */\n')
            .write('let parent = null;\n\n')

        // getParent function
        compiler
            .write('/**').write('\n')
            .write(' * @param {TwingContext} context').write('\n')
            .write(' */').write('\n')
            .write("const getParent = async (context) => {\n");

        if (parent) {
            compiler
                .write('if (parent !== null) {\n')
                .write('return Promise.resolve(parent);\n')
                .write('}\n\n')
                .write('return template.loadTemplate(').write('\n')
                .subCompile(parent).write(',').write('\n')
                .render(parent.line).write('\n')
                .write(")")
            ;

            // if the parent name is not dynamic, then we can cache the parent as it will never change
            if (parent.type === "constant") {
                compiler
                    .write('.then((loadedParent) => {\n')
                    .write('parent = loadedParent;\n\n')
                    .write('return parent;\n')
                    .write('})')
            }

            compiler
                .write(';\n')
            ;
        } else {
            compiler.write('return Promise.resolve(null);\n');
        }

        compiler.write("};\n\n")
    }

    const compileGetTraits = (compiler: TwingCompiler) => {
        const {traits} = baseNode.children;
        const count = getChildrenCount(traits);

        compiler
            .write('/** @type {TemplateBlocksMap | null} */\n')
            .write('let traits = null;\n\n')
            .write("const getTraits = async() => {\n")

        if (count > 0) {
            compiler
                .write('if (traits === null) {\n')
                .write('traits = new Map();\n\n');

            for (let [i, trait] of getChildren(traits)) {
                const {template, targets} = trait.children;

                compiler
                    .write(`let trait_${i} = await template.loadTemplate(`).write('\n')
                    .subCompile(template).write(', ').write('\n')
                    .render(template.line).write('\n')
                    .write(");\n\n")
                ;

                compiler
                    .write(`if (!trait_${i}.canBeUsedAsATrait) {\n`)
                    .write('throw runtime.createError(\'Template ')
                    .subCompile(template)
                    .write(' cannot be used as a trait.\', ')
                    .render(template.line)
                    .write(", template.source);\n")
                    .write('}\n\n')
                    .write(`let traits_${i} = runtime.cloneMap(await trait_${i}.getBlocks());\n\n`)
                ;

                for (let [key, target] of getChildren(targets)) {
                    compiler
                        .write(`if (!traits_${i}.has(`)
                        .string(key)
                        .write(")) {\n")
                        .write('throw runtime.createError(\'Block ')
                        .string(key as string)
                        .write(' is not defined in trait ')
                        .subCompile(template)
                        .write('.\', ')
                        .render(target.line)
                        .write(', template.source);\n')
                        .write('}\n\n')
                        .write(`traits_${i}.set(`)
                        .subCompile(target)
                        .write(`, traits_${i}.get(`)
                        .string(key)
                        .write(`)); traits_${i}.delete(`)
                        .string(key)
                        .write(');\n\n')
                    ;
                }
            }

            for (let i = 0; i < count; ++i) {
                compiler.write(`traits = runtime.merge(traits, traits_${i});\n`);
            }

            compiler.write('}\n\n');

            compiler
                .write('return Promise.resolve(traits);\n')
        } else {
            compiler.write('return Promise.resolve(new Map());\n')
        }

        compiler.write('};\n\n');
    }

    const compileFactoryFooter = (compiler: TwingCompiler) => {
        compiler
            .write('return template;\n')
            .write(`},\n`)
    }

    const compileTemplate = (compiler: TwingCompiler) => {
        compileFactoryHeader(compiler);
        compileCanBeUsedAsATrait(compiler);
        compileDisplay(compiler);
        compileGetParent(compiler);
        compileGetTraits(compiler);
        compileTemplateInstantiation(compiler);
        compileFactoryFooter(compiler);
    };

    const moduleNode: TwingModuleNode = {
        ...baseNode,
        compile: (compiler) => {
            let index = baseNode.attributes.index;

            if (index === 0) {
                compiler
                    .write('module.exports = {\n')

                ;
            }

            compileTemplate(compiler);

            for (const template of baseNode.attributes.embedded_templates) {
                compiler.subCompile(template);
            }

            if (index === 0) {
                compiler.write('};\n');
            }
        }
    };

    return moduleNode;
};
