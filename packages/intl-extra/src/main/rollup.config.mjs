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
            rmSync(destination, {force: true, recursive: true});
        }
    }
];

const program = () => {
    const version = process.env.VERSION || '0.0.0-SNAPSHOT';

    console.log(`Building @toppynl/twing-intl-extra under version ${version}...`);

    return [{
        input: ['lib.ts'],
        external,
        plugins: [
            ...plugins,
            createTypeScriptPlugin({compilerOptions: {declaration: true}})
        ],
        output: [{
            format: "commonjs",
            file: join('target', commonjsTargetName),
            plugins: [
                createPackageManifestPlugin({
                    name: '@toppynl/twing-intl-extra',
                    version,
                    description: "Intl helpers for Twing (port of twig/intl-extra)",
                    keywords: ["twing", "twig", "intl-extra", "i18n", "intl", "format"],
                    license: "MIT",
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
                    dependencies: {
                        "countries-and-timezones": "^3.0.0"
                    },
                    peerDependencies: {
                        "@toppynl/twing": "*",
                        "luxon": "*"
                    },
                    node: ">=20.0.0"
                })
            ]
        }]
    }, {
        input: ['light.ts'],
        external,
        plugins: [
            ...plugins,
            createTypeScriptPlugin({compilerOptions: {declaration: true}})
        ],
        output: [{
            format: "commonjs",
            file: join('target/light', commonjsTargetName)
        }]
    }];
};

export default program;
