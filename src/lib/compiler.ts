import type {TwingBaseNode} from "./node";
import {addcslashes} from "locutus/php/strings";
import {TwingFunction} from "./function";
import {TwingTest} from "./test";
import {TwingFilter} from "./filter";

export type CompilerEnvironment = {
    getFunction: (name: string) => TwingFunction | null;
    getTest: (name: string) => TwingTest | null;
    getFilter: (name: string) => TwingFilter | null;
};

export interface TwingCompiler {
    readonly environment: CompilerEnvironment;

    readonly source: string;

    compile(node: TwingBaseNode): this;

    subCompile(node: TwingBaseNode): this;

    /**
     * Adds the passed data to the compiled code, as-is.
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

    addSourceMapEnter(node: TwingBaseNode): this;

    addSourceMapLeave(): this;
}

export const createCompiler = (
    environment: CompilerEnvironment
): TwingCompiler => {
    let source: string = '';

    const compiler: TwingCompiler = {
        environment,
        get source() {
            return source;
        },
        compile: (node) => {
            source = '';

            compiler.subCompile(node);

            return compiler;
        },
        subCompile: (node) => {
            node.compile(compiler);

            return compiler;
        },
        write: (data) => {
            source += data;

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
                compiler.write(data);
            } else if (data === null || data === undefined) {
                compiler.write(`${data}`);
            } else if (typeof data === 'boolean') {
                compiler.write(data ? 'true' : 'false');
            } else if (data instanceof Map) {
                compiler.write('new Map([');

                let first = true;

                for (let [k, v] of data) {
                    if (!first) {
                        compiler.write(', ');
                    }

                    first = false;

                    compiler
                        .write('[')
                        .render(k)
                        .write(', ')
                        .render(v)
                        .write(']')
                    ;
                }

                compiler.write('])');
            } else if (typeof data === 'object') {
                compiler.write('{');

                let first = true;

                for (let k in data) {
                    if (!first) {
                        compiler.write(', ');
                    }

                    first = false;

                    compiler
                        .write(`"${k}"`)
                        .write(': ')
                        .render(data[k])
                    ;
                }

                compiler.write('}');
            } else {
                compiler.string(data);
            }

            return compiler;
        },
        addSourceMapEnter: (node) => {
            compiler
                .write('sourceMapRuntime?.enterSourceMapBlock(')
                .write(node.line)
                .write(', ')
                .write(node.column)
                .write(', ')
                .string(node.type)
                .write(', ')
                .write('template.source, outputBuffer);\n')
            ;

            return compiler;
        },
        addSourceMapLeave: () => {
            compiler
                .write('sourceMapRuntime?.leaveSourceMapBlock(outputBuffer);\n')
            ;

            return compiler;
        }
    };

    return compiler;
};
