import {createTypeScriptPlugin} from "@vitrail/rollup-plugin-typescript";
import {createPackageManifestPlugin} from "@nightlycommit/rollup-plugin-package-manifest";
import {rmSync} from "node:fs";
import {dirname, join} from "node:path";

const commonjsTargetName = 'index.cjs';
const moduleTargetName = 'index.mjs';

/**
 * @param moduleId {string}
 * @returns {boolean}
 */
const external = (moduleId) => {
    return !moduleId.startsWith('.') && !moduleId.startsWith('/');
};

const plugins = [
    {
        generateBundle: (options) => {
            const destination = dirname(options.file);

            rmSync(destination, {
                force: true,
                recursive: true
            });
        }
    }
];

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
            'lib.ts'
        ],
        external,
        plugins: [
            ...plugins,
            createTypeScriptPlugin({
                compilerOptions: {
                    declaration: true
                }
            })
        ],
        output: [
            {
                format: "module",
                file: join('target', moduleTargetName),
                plugins: [
                    createPackageManifestPlugin({
                        name: 'twing',
                        version,
                        description: "First-class Twig engine for the JavaScript ecosystem",
                        keywords: [
                            "browser",
                            "compiler",
                            "template",
                            "twig",
                            "twig-engine",
                            "typescript"
                        ],
                        author: "Eric MORAND <eric.morand@gmail.com>",
                        license: "BSD-2-Clause",
                        homepage: "http://twing.nightlycommit.com",
                        bugs: "https://gitlab.com/nightlycommit/twing/-/issues",
                        repository: {
                            type: "git",
                            url: "https://gitlab.com/nightlycommit/twing"
                        },
                        main: "index.cjs",
                        types: "lib.d.ts",
                        exports: {
                            ".": {
                                import: "./index.mjs",
                                require: "./index.cjs",
                                types: "./lib.d.ts"
                            },
                            "./light": {
                                import: "./light/index.mjs",
                                require: "./light/index.cjs",
                                types: "./light/light.d.ts"
                            }
                        },
                        node: ">=16.0.0"
                    })
                ]
            },
            {
                format: "commonjs",
                file: join('target', commonjsTargetName)
            }
        ]
    }, {
        input: [
            'light.ts'
        ],
        external,
        plugins: [
            ...plugins,
            createTypeScriptPlugin({
                compilerOptions: {
                    declaration: true
                }
            })
        ],
        output: [
            {
                format: "module",
                file: join('target/light', moduleTargetName)
            },
            {
                format: "commonjs",
                file: join('target/light', commonjsTargetName)
            }
        ]
    }];

    return options;
};

export default program;