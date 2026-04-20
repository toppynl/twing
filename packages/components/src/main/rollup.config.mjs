import {createTypeScriptPlugin} from "@vitrail/rollup-plugin-typescript";
import {createPackageManifestPlugin} from "@nightlycommit/rollup-plugin-package-manifest";
import {rmSync} from "node:fs";
import {dirname, join} from "node:path";

const commonjsTargetName = 'index.cjs';

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

const program = () => {
    const version = process.env.VERSION || '0.0.0-SNAPSHOT';

    console.log(`Building @toppynl/twing-components under version ${version}...`);

    const options = [{
        input: ['lib.ts'],
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
                format: "commonjs",
                file: join('target', commonjsTargetName),
                plugins: [
                    createPackageManifestPlugin({
                        name: '@toppynl/twing-components',
                        version,
                        description: "Twig component tags for Twing (props, component, <twig:...>)",
                        keywords: ["twing", "twig", "components", "props", "ux-twig-component"],
                        license: "BSD-2-Clause",
                        main: "index.cjs",
                        types: "lib.d.ts",
                        exports: {
                            ".": {
                                import: "./index.cjs",
                                require: "./index.cjs",
                                types: "./lib.d.ts"
                            },
                            "./light": {
                                import: "./light/index.cjs",
                                require: "./light/index.cjs",
                                types: "./light/light.d.ts"
                            }
                        },
                        peerDependencies: {
                            twing: "*",
                            "@toppynl/twing-html-extra": "*"
                        },
                        node: ">=16.0.0"
                    })
                ]
            }
        ]
    }, {
        input: ['light.ts'],
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
                format: "commonjs",
                file: join('target/light', commonjsTargetName)
            }
        ]
    }];

    return options;
};

export default program;
