import {createTypeScriptPlugin} from "@vitrail/rollup-plugin-typescript";
import {createPackageManifestPlugin} from "@nightlycommit/rollup-plugin-package-manifest";
import {rmSync} from "node:fs";
import {dirname, join} from "node:path";

const targetName = 'index.cjs';

/**
 * @param moduleId {string}
 * @returns {boolean}
 */
const external = (moduleId) => {
    return !moduleId.startsWith('.') && !moduleId.startsWith('/');
};

/**
 * @var {import("rollup").RollupOptionsFunction}
 */
const program = (commandLineArgs) => {
    const version = process.env.VERSION || '1.0.0-SNAPSHOT';

    console.log(`Building main artifact under version ${version}...`);

    /**
     * @var {Array<import("rollup").RollupOptions>}
     */
    const options = [{
        input: [
            'index.ts'
        ],
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
    }, {
        input: [
            'tests/lib.ts'
        ],
        external,
        plugins: [
            createTypeScriptPlugin({
                compilerOptions: {
                    declaration: false
                }
            })
        ],
        output: [
            {
                format: "commonjs",
                file: join('target', 'entry.cjs'),
            }
        ]
    }];

    return options;
};

export default program;