import {createTypeScriptPlugin} from "@vitrail/rollup-plugin-typescript";
import {rmSync} from "node:fs";
import {dirname, join} from "node:path";

const targetName = 'index.cjs';

const external = (moduleId) => {
    return !moduleId.startsWith('.') && !moduleId.startsWith('/');
};

const program = () => {
    const options = [{
        input: ['index.ts'],
        external,
        treeshake: false,
        plugins: [
            {
                generateBundle: (options) => {
                    const destination = dirname(options.file);

                    rmSync(destination, {
                        force: true,
                        recursive: true
                    });
                }
            },
            createTypeScriptPlugin({
                compilerOptions: {
                    declaration: false
                }
            })
        ],
        output: [
            {
                format: "commonjs",
                file: join('target', targetName),
                sourcemap: true
            }
        ]
    }];

    return options;
};

export default program;
