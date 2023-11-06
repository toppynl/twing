import type {BaseNode} from "./node";
import {addcslashes} from "locutus/php/strings";
import {TwingFunction} from "./function";
import {TwingTest} from "./test";
import {TwingFilter} from "./filter";

export type CompilerOptions = {
    sourceMap?: boolean;
    strictVariables?: boolean;
};

export type CompilerEnvironment = {
    getFunction: (name: string) => TwingFunction | null;
    getTest: (name: string) => TwingTest | null;
    getFilter: (name: string) => TwingFilter | null;
    isSandboxed: () => boolean;
};

export interface TwingCompiler {
    readonly environment: CompilerEnvironment;

    readonly options: CompilerOptions;

    readonly source: string;

    compile(node: BaseNode, indentation?: number): this;
    
    subCompile(node: BaseNode, options?: {
        isDefinedTest?: boolean;
        ignoreStrictCheck?: boolean;
        optimizable?: boolean;
    }): this;

    /**
     * Adds the passed data to the compiled code, as-is, without indentation.
     */
    raw(data: any): this;

    /**
     * Adds the passed data to the compiled code, as-is, with indentation.
     */
    write(data: any): this;

    /**
     * Adds the passed data to the compiled code, as a quoted string.
     */
    string(value: any): this;

    /**
     * Adds the passed data to the compiled code, using the most appropriate rendering technique based on its type.
     */
    render(data: any): this;

    addSourceMapEnter(node: BaseNode): this;

    addSourceMapLeave(): this;

    /**
     * Indents the generated code.
     */
    indent(step?: number): this;

    /**
     * Outdents the generated code.
     *
     * @throws Error When the indentation level would become negative
     */
    outdent(step?: number): this;
}

export const createCompiler = (
    environment: CompilerEnvironment,
    options?: CompilerOptions
): TwingCompiler => {
    let source: string = '';
    let currentIndentation: number = 0;

    const compiler: TwingCompiler = {
        environment,
        options: options || {
            sourceMap: false,
            strictVariables: false
        },
        get source() {
            return source;
        },
        compile: (node, indentation = 0) => {
            currentIndentation = indentation;
            source = '';

            compiler.subCompile(node);

            return compiler;
        },
        subCompile: (node, flags) => {
            node.compile(compiler, flags ? {
                isDefinedTest: flags.isDefinedTest,
                ignoreStrictCheck: flags.ignoreStrictCheck,
                optimizable: flags.optimizable
            } : undefined);

            return compiler;
        },
        raw: (data) => {
            source += data;

            return compiler;
        },
        write: (data) => {
            source += ' '.repeat(currentIndentation * 4) + data;

            return compiler;
        },
        string: (value) => {
            if (value !== null && value !== undefined) {
                if (typeof value === 'string') {
                    value = '`' + addcslashes(value, "\0\t\\`").replace(/\${/g, '\\${') + '`';
                }
            } else {
                value = '``';
            }

            source += value;

            return compiler;
        },
        render: (data) => {
            if (typeof data === 'number') {
                compiler.raw(data);
            } else if (data === null || data === undefined) {
                compiler.raw(`${data}`);
            } else if (typeof data === 'boolean') {
                compiler.raw(data ? 'true' : 'false');
            } else if (data instanceof Map) {
                compiler.raw('new Map([');

                let first = true;

                for (let [k, v] of data) {
                    if (!first) {
                        compiler.raw(', ');
                    }

                    first = false;

                    compiler
                        .raw('[')
                        .render(k)
                        .raw(', ')
                        .render(v)
                        .raw(']')
                    ;
                }

                compiler.raw('])');
            } else if (typeof data === 'object') {
                compiler.raw('{');

                let first = true;

                for (let k in data) {
                    if (!first) {
                        compiler.raw(', ');
                    }

                    first = false;

                    compiler
                        .raw(`"${k}"`)
                        .raw(': ')
                        .render(data[k])
                    ;
                }

                compiler.raw('}');
            } else {
                compiler.string(data);
            }

            return compiler;
        },
        addSourceMapEnter: (node) => {
            if (compiler.options.sourceMap) {
                compiler
                    .write('runtime.enterSourceMapBlock(')
                    .raw(node.line)
                    .raw(', ')
                    .raw(node.column)
                    .raw(', ')
                    .string(node.type)
                    .raw(', ')
                    .raw('template.source, outputBuffer);\n')
            }

            return compiler;
        },
        addSourceMapLeave: () => {
            if (compiler.options.sourceMap) {
                compiler
                    .write('runtime.leaveSourceMapBlock(outputBuffer);\n')
                ;
            }

            return compiler;
        },
        indent: (step: number = 1) => {
            currentIndentation += step;

            return compiler;
        },
        outdent: (step: number = 1) => {
            if (currentIndentation < step) {
                throw new Error('Unable to call outdent() as the indentation would become negative.');
            }

            currentIndentation -= step;

            return compiler;
        }
    };

    return compiler;
};
