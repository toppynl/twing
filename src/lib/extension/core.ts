import {TwingExtension} from "../extension";
import {createAndNode} from "../node/expression/binary/and";
import {getChildren, getChildrenCount} from "../node";
import {createInNode} from "../node/expression/binary/in";
import {createGreaterThanNode} from "../node/expression/binary/greater";
import {createLessThanNode} from "../node/expression/binary/less";
import {createNotNode} from "../node/expression/unary/not";
import {createNegativeNode} from "../node/expression/unary/neg";
import {createPositiveNode} from "../node/expression/unary/pos";
import {createFunction} from "../function";
import {createConcatNode} from "../node/expression/binary/concat";
import {createMultiplyNode} from "../node/expression/binary/mul";
import {createDivNode} from "../node/expression/binary/div";
import {createFloorDivNode} from "../node/expression/binary/floor-div";
import {createModuloNode} from "../node/expression/binary/mod";
import {createSubtractNode} from "../node/expression/binary/sub";
import {createAddNode} from "../node/expression/binary/add";
import {createRangeNode} from "../node/expression/binary/range";
import {createEqualNode} from "../node/expression/binary/equal";
import {createNotEqualToNode} from "../node/expression/binary/not-equal";
import {createOrNode} from "../node/expression/binary/or";
import {createBitwiseOrNode} from "../node/expression/binary/bitwise-or";
import {createBitwiseXorNode} from "../node/expression/binary/bitwise-xor";
import {createBitwiseAndNode} from "../node/expression/binary/bitwise-and";
import {createGreaterThanOrEqualToNode} from "../node/expression/binary/greater-equal";
import {createLessThanOrEqualToNode} from "../node/expression/binary/less-equal";
import {createNotInNode} from "../node/expression/binary/not-in";
import {createNullishCoalescingNode} from "../node/expression/nullish-coalescing";
import {BaseExpressionNode} from "../node/expression";
import {createPowerNode} from "../node/expression/binary/power";
import {createDefinedTestNode} from "../node/expression/call/test/defined";
import {createTest, TwingTest} from "../test";
import {createMatchesNode} from "../node/expression/binary/matches";
import {createStartsWithNode} from "../node/expression/binary/starts-with";
import {createEndsWithNode} from "../node/expression/binary/ends-with";
import {createFilter} from "../filter";
import {Settings as DateTimeSettings} from 'luxon';
import {createDefaultFilterNode} from "../node/expression/call/filter/default";
import {createApplyTagHandler} from "../tag-handler/apply";
import {createOperator, TwingOperator} from "../operator";
import {even} from "./core/tests/even";
import {odd} from "./core/tests/odd";
import {sameAs} from "./core/tests/same-as";
import {nullTest} from "./core/tests/null";
import {divisibleBy} from "./core/tests/divisible-by";
import {min} from "./core/functions/min";
import {max} from "./core/functions/max";
import {date} from "./core/filters/date";
import {dateModify} from "./core/filters/date-modify";
import {format} from "./core/filters/format";
import {replace} from "./core/filters/replace";
import {numberFormat} from "./core/filters/number-format";
import {abs} from "./core/filters/abs";
import {urlEncode} from "./core/filters/url-encode";
import {jsonEncode} from "./core/filters/json-encode";
import {convertEncoding} from "./core/filters/convert-encoding";
import {title} from "./core/filters/title";
import {capitalize} from "./core/filters/capitalize";
import {upper} from "./core/filters/upper";
import {lower} from "./core/filters/lower";
import {striptags} from "./core/filters/striptags";
import {trim} from "./core/filters/trim";
import {nl2br} from "./core/filters/nl2br";
import {raw} from "./core/filters/raw";
import {join} from "./core/filters/join";
import {split} from "./core/filters/split";
import {sort} from "./core/filters/sort";
import {merge as mergeFilter} from "./core/filters/merge";
import {batch} from "./core/filters/batch";
import {reverse as reverseFilter} from "./core/filters/reverse";
import {length} from "./core/filters/length";
import {slice as sliceFilter} from "./core/filters/slice";
import {first as firstFilter} from "./core/filters/first";
import {last} from "./core/filters/last";
import {defaultFilter} from "./core/filters/default";
import {escape} from "./core/filters/escape";
import {round} from "./core/filters/round";
import {include} from "./core/functions/include";
import {arrayKeys} from "./core/filters/array-keys";
import {spaceless} from "./core/filters/spaceless";
import {column} from "./core/filters/column";
import {filter} from "./core/filters/filter";
import {map} from "./core/filters/map";
import {reduce} from "./core/filters/reduce";
import {createAutoEscapeTagHandler} from "../tag-handler/auto-escape";
import {createEscaperNodeVisitor} from "../node-visitor/escaper";
import {createSandboxNodeVisitor} from "../node-visitor/sandbox";
import {range} from "./core/functions/range";
import {constant} from "./core/functions/constant";
import {cycle} from "./core/functions/cycle";
import {random} from "./core/functions/random";
import {source} from "./core/functions/source";
import {templateFromString} from "./core/functions/template-from-string";
import {dump} from "./core/functions/dump";
import {empty} from "./core/tests/empty";
import {iterable} from "./core/tests/iterable";
import {date as dateFunction} from "./core/functions/date";
import {TwingSourceMapNodeFactorySpaceless} from "../source-map/node-factory/spaceless";
import {TwingSourceMapNodeFactory} from "../source-map/node-factory";
import {createConstantTestNode} from "../node/expression/call/test/constant";
import {createMacroAutoImportNodeVisitor} from "../node-visitor/macro-auto-import";
import {extname, basename} from "path";
import {PrimitiveEscapingStrategyResolver, TwingEnvironment} from "../environment";
import {ArgumentsNode} from "../node/expression/arguments";
import {createSetTagHandler} from "../tag-handler/set";
import {createIfTagHandler} from "../tag-handler/if";
import {createForTagHandler} from "../tag-handler/for";
import {createVerbatimTagHandler} from "../tag-handler/verbatim";
import {createEmbedTagHandler} from "../tag-handler/embed";
import {createExtendsTagHandler} from "../tag-handler/extends";
import {createBlockTagHandler} from "../tag-handler/block";
import {createSpacelessTagHandler} from "../tag-handler/spaceless";
import {createIncludeTagHandler} from "../tag-handler/include";
import {createDeprecatedTagHandler} from "../tag-handler/deprecated";
import {createUseTagHandler} from "../tag-handler/use";
import {createImportTagHandler} from "../tag-handler/import";
import {createMacroTagHandler} from "../tag-handler/macro";
import {createFilterTagHandler} from "../tag-handler/filter";
import {createWithTagHandler} from "../tag-handler/with";
import {createFromTagHandler} from "../tag-handler/from";
import {createLineTagHandler} from "../tag-handler/line";
import {createSandboxTagHandler} from "../tag-handler/sandbox";
import {createDoTagHandler} from "../tag-handler/do";
import {createFlushTagHandler} from "../tag-handler/flush";
import {TwingNodeVisitor} from "../node-visitor";

export class TwingExtensionCore extends TwingExtension {
    private dateFormats: [string, string] = ['F j, Y H:i', '%d days'];
    private numberFormat: [number, string, string] = [0, '.', ','];
    // @ts-ignore
    private timezone: string = null;
    private escapers: Map<string, Function> = new Map();
    // @ts-ignore
    private defaultStrategy: string | false | PrimitiveEscapingStrategyResolver;

    /**
     * @param {string | false | PrimitiveEscapingStrategyResolver} defaultStrategy An escaping strategy
     */
    constructor(
        private readonly environment: TwingEnvironment,
        defaultStrategy: string | false | PrimitiveEscapingStrategyResolver = 'html',
    ) {
        super();

        this.setDefaultStrategy(defaultStrategy);
    }

    /**
     * Sets the default strategy to use when not defined by the user.
     *
     * @param {string | false | PrimitiveEscapingStrategyResolver} defaultStrategy An escaping strategy
     */
    setDefaultStrategy(defaultStrategy: string | false | PrimitiveEscapingStrategyResolver) {
        if (defaultStrategy === 'name') {
            defaultStrategy = (name: string) => {
                let extension = extname(name);

                if (extension === '.twig') {
                    name = basename(name, extension);

                    extension = extname(name);
                }

                switch (extension) {
                    case '.js':
                        return 'js';

                    case '.css':
                        return 'css';

                    case '.txt':
                        return false;

                    default:
                        return 'html';
                }
            };
        }

        this.defaultStrategy = defaultStrategy;
    }

    /**
     * Gets the default escaping strategy.
     *
     * @param {string} name The template name
     *
     * @returns {string | false} The default strategy to use for the template
     */
    getDefaultStrategy(name: string): string | false {
        if (typeof this.defaultStrategy === 'function') {
            return this.defaultStrategy(name);
        }

        return this.defaultStrategy;
    }

    /**
     * Defines a new escaper to be used via the escape filter.
     *
     * @param {string} strategy     The strategy name that should be used as a strategy in the escape call
     * @param {Function} callable   A valid PHP callable
     */
    setEscaper(strategy: string, callable: Function) {
        this.escapers.set(strategy, callable);
    }

    /**
     * Gets all defined escapers.
     *
     * @returns {Map<string, Function>}
     */
    getEscapers() {
        return this.escapers;
    }

    /**
     * Sets the default format to be used by the date filter.
     *
     * @param {string} format The default date format string
     * @param {string} dateIntervalFormat The default date interval format string
     */
    // @ts-ignore
    setDateFormat(format: string) {
        this.dateFormats[0] = format;
    }

    setDateIntervalFormat(format: string) {
        this.dateFormats[1] = format;
    }

    /**
     * Gets the default format to be used by the date filter.
     *
     * @return array The default date format string and the default date interval format string
     */
    getDateFormats() {
        return this.dateFormats;
    }

    /**
     * Sets the default timezone to be used by the date filter.
     *
     * @param {string} timezone The default timezone string or a TwingDateTimeZone object
     */
    setTimezone(timezone: string) {
        this.timezone = timezone;
    }

    /**
     * Gets the default timezone to be used by the date filter.
     *
     * @returns {string} The default timezone currently in use
     */
    getTimezone(): string {
        if (this.timezone === null) {
            this.timezone = DateTimeSettings.defaultZoneName;
        }

        return this.timezone;
    }

    /**
     * Sets the default format to be used by the number_format filter.
     *
     * @param {number} decimal the number of decimal places to use
     * @param {string} decimalPoint the character(s) to use for the decimal point
     * @param {string} thousandSep  the character(s) to use for the thousands separator
     */
    setNumberFormat(decimal: number, decimalPoint: string, thousandSep: string) {
        this.numberFormat = [decimal, decimalPoint, thousandSep];
    }

    /**
     * Get the default format used by the number_format filter.
     *
     * @return array The arguments for number_format()
     */
    getNumberFormat(): [number, string, string] {
        return this.numberFormat;
    }

    getTokenParsers() {
        return [
            createApplyTagHandler(),
            createAutoEscapeTagHandler(),
            createBlockTagHandler(),
            createDeprecatedTagHandler(),
            createDoTagHandler(),
            createEmbedTagHandler(),
            createExtendsTagHandler(),
            createFilterTagHandler(),
            createFlushTagHandler(),
            createForTagHandler(),
            createFromTagHandler(),
            createIfTagHandler(),
            createImportTagHandler(),
            createIncludeTagHandler(),
            createLineTagHandler(),
            createMacroTagHandler(),
            createSandboxTagHandler(),
            createSetTagHandler(),
            createSpacelessTagHandler(),
            createUseTagHandler(),
            createVerbatimTagHandler(),
            createWithTagHandler()
        ];
    }

    getSourceMapNodeFactories(): TwingSourceMapNodeFactory[] {
        return [
            new TwingSourceMapNodeFactorySpaceless()
        ];
    }

    getNodeVisitors(): Array<TwingNodeVisitor> {
        return [
            createEscaperNodeVisitor(this.environment),
            createMacroAutoImportNodeVisitor(),
            createSandboxNodeVisitor(this.environment)
        ];
    }

    getFilters() {
        return [
            createFilter('abs', abs, []),
            createFilter('batch', batch, [
                {
                    name: 'size'
                },
                {
                    name: 'fill',
                    defaultValue: null
                },
                {
                    name: 'preserve_keys',
                    defaultValue: true
                }
            ]),
            createFilter('capitalize', capitalize, []),
            createFilter('column', column, [
                {
                    name: 'name'
                }
            ]),
            createFilter('convert_encoding', convertEncoding, [
                {
                    name: 'to'
                },
                {
                    name: 'from'
                }
            ], {
                pre_escape: 'html',
                is_safe: ['html']
            }),
            createFilter('date', date, [
                {
                    name: 'format',
                    defaultValue: null
                },
                {
                    name: 'timezone',
                    defaultValue: null
                }
            ], {
                needs_template: true
            }),
            createFilter('date_modify', dateModify, [
                {
                    name: 'modifier'
                }
            ], {
                needs_template: true
            }),
            createFilter('default', defaultFilter, [
                {
                    name: 'default'
                }
            ], {
                expression_factory: (node, _filterName, argumentsNode, line, column) => {
                    return createDefaultFilterNode(node, argumentsNode, line, column);
                }
            }),
            createFilter('e', escape, [
                {
                    name: 'strategy',
                    defaultValue: null
                },
                {
                    name: 'charset',
                    defaultValue: null
                }
            ], {
                needs_template: true,
                is_safe_callback: this.escapeFilterIsSafe
            }),
            createFilter('escape', escape, [
                {
                    name: 'strategy',
                    defaultValue: null
                },
                {
                    name: 'charset',
                    defaultValue: null
                }
            ], {
                needs_template: true,
                is_safe_callback: this.escapeFilterIsSafe
            }),
            createFilter('filter', filter, [
                {
                    name: 'array'
                },
                {
                    name: 'arrow',
                    defaultValue: null
                }
            ]),
            createFilter('first', firstFilter, []),
            createFilter('format', format, [], {
                is_variadic: true
            }),
            createFilter('join', join, [
                {
                    name: 'glue',
                    defaultValue: ''
                },
                {
                    name: 'and',
                    defaultValue: null
                }
            ]),
            createFilter('json_encode', jsonEncode, [
                {
                    name: 'options',
                    defaultValue: null
                }
            ]),
            createFilter('keys', arrayKeys, []),
            createFilter('last', last, []),
            createFilter('length', length, []),
            createFilter('lower', lower, []),
            createFilter('map', map, [
                {
                    name: 'arrow'
                }
            ]),
            createFilter('merge', mergeFilter, [
                {
                    name: 'source'
                }
            ]),
            createFilter('nl2br', nl2br, [], {
                pre_escape: 'html',
                is_safe: ['html']
            }),
            createFilter('number_format', numberFormat, [
                {
                    name: 'decimal',
                    defaultValue: null
                },
                {
                    name: 'decimal_point',
                    defaultValue: null
                },
                {
                    name: 'thousand_sep',
                    defaultValue: null
                }
            ], {
                needs_template: true
            }),
            createFilter('raw', raw, [], {
                is_safe: ['all']
            }),
            createFilter('reduce', reduce, [
                {
                    name: 'arrow'
                },
                {
                    name: 'initial',
                    defaultValue: null
                }
            ]),
            createFilter('replace', replace, [
                {
                    name: 'from'
                }
            ]),
            createFilter('reverse', reverseFilter, [
                {
                    name: 'preserve_keys',
                    defaultValue: false
                }
            ]),
            createFilter('round', round, [
                {
                    name: 'precision',
                    defaultValue: 0
                },
                {
                    name: 'method',
                    defaultValue: 'common'
                }
            ]),
            createFilter('slice', sliceFilter, [
                {
                    name: 'start'
                },
                {
                    name: 'length',
                    defaultValue: null
                },
                {
                    name: 'preserve_keys',
                    defaultValue: false
                }
            ]),
            createFilter('sort', sort, []),
            createFilter('spaceless', spaceless, [], {
                is_safe: ['html']
            }),
            createFilter('split', split, [
                {
                    name: 'delimiter'
                },
                {
                    name: 'limit',
                    defaultValue: null
                }
            ]),
            createFilter('striptags', striptags, [
                {
                    name: 'allowable_tags'
                }
            ]),
            createFilter('title', title, []),
            createFilter('trim', trim, [
                {
                    name: 'character_mask',
                    defaultValue: null
                },
                {
                    name: 'side',
                    defaultValue: 'both'
                }
            ]),
            createFilter('upper', upper, []),
            createFilter('url_encode', urlEncode, []),
        ];
    }

    getFunctions() {
        return [
            createFunction('constant', constant, [
                {name: 'name'},
                {name: 'object', defaultValue: null}
            ], {
                needs_context: true
            }),
            createFunction('cycle', cycle, [
                {
                    name: 'values'
                },
                {
                    name: 'position'
                }
            ]),
            createFunction('date', dateFunction, [
                {
                    name: 'date',
                    defaultValue: null
                },
                {
                    name: 'timezone',
                    defaultValue: null
                }
            ], {
                needs_template: true
            }),
            createFunction('dump', dump, [], {
                is_safe: ['html'],
                needs_context: true,
                is_variadic: true
            }),
            createFunction('include', include, [
                {
                    name: 'template'
                },
                {
                    name: 'variables',
                    defaultValue: {}
                },
                {
                    name: 'with_context',
                    defaultValue: true
                },
                {
                    name: 'ignore_missing',
                    defaultValue: false
                },
                {
                    name: 'sandboxed',
                    defaultValue: false
                }
            ], {
                needs_template: true,
                needs_context: true,
                needs_output_buffer: true,
                is_safe: ['all']
            }),
            createFunction('max', max, [], {
                is_variadic: true
            }),
            createFunction('min', min, [], {
                is_variadic: true
            }),
            createFunction('random', random, [
                {
                    name: 'values',
                    defaultValue: null
                },
                {
                    name: 'max',
                    defaultValue: null
                }
            ], {
                needs_template: true
            }),
            createFunction('range', range, [
                {
                    name: 'low'
                },
                {
                    name: 'high'
                },
                {
                    name: 'step',
                    defaultValue: 1
                }
            ]),
            createFunction('source', source, [
                {
                    name: 'name'
                },
                {
                    name: 'ignore_missing',
                    defaultValue: false
                }
            ], {
                needs_template: true,
                is_safe: ['all']
            }),
            createFunction('template_from_string', templateFromString, [
                {
                    name: 'template'
                },
                {
                    name: 'name',
                    defaultValue: null
                }
            ], {
                needs_template: true
            })
        ];
    }

    getTests(): Array<TwingTest> {
        return [
            createTest('constant', null, [], {
                expression_factory: (node, _name, argumentsNode, line, column) => {
                    return createConstantTestNode(node, argumentsNode, line, column);
                }
            }),
            createTest('divisible by', divisibleBy, [{
                name: 'divisor'
            }]),
            createTest('defined', null, [], {
                expression_factory: (node, _name, argumentsNode, line, column) => {
                    return createDefinedTestNode(node, argumentsNode, line, column);
                }
            }),
            createTest('empty', empty, []),
            createTest('even', even, []),
            createTest('iterable', iterable, []),
            createTest('none', nullTest, []),
            createTest('null', nullTest, []),
            createTest('odd', odd, []),
            createTest('same as', sameAs, [
                {
                    name: 'comparand'
                }
            ]),
        ];
    }

    getOperators(): Array<TwingOperator> {
        return [
            createOperator('not', "UNARY", 50, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createNotNode(operands[0], line, column);
            }),
            createOperator('-', "UNARY", 500, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createNegativeNode(operands[0], line, column);
            }),
            createOperator('+', "UNARY", 500, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createPositiveNode(operands[0], line, column);
            }),
            createOperator('or', "BINARY", 10, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createOrNode(operands, line, column);
            }),
            createOperator('and', "BINARY", 15, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createAndNode(operands, line, column);
            }),
            createOperator('b-or', "BINARY", 16, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createBitwiseOrNode(operands, line, column);
            }),
            createOperator('b-xor', "BINARY", 17, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createBitwiseXorNode(operands, line, column);
            }),
            createOperator('b-and', "BINARY", 18, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createBitwiseAndNode(operands, line, column);
            }),
            createOperator('==', "BINARY", 20, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createEqualNode(operands, line, column);
            }),
            createOperator('!=', "BINARY", 20, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createNotEqualToNode(operands, line, column);
            }),
            createOperator('<', "BINARY", 20, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createLessThanNode(operands, line, column);
            }),
            createOperator('<=', "BINARY", 20, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createLessThanOrEqualToNode(operands, line, column);
            }),
            createOperator('>', "BINARY", 20, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createGreaterThanNode(operands, line, column);
            }),
            createOperator('>=', "BINARY", 20, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createGreaterThanOrEqualToNode(operands, line, column);
            }),
            createOperator('not in', "BINARY", 20, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createNotInNode(operands, line, column);
            }),
            createOperator('in', "BINARY", 20, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createInNode(operands, line, column);
            }),
            createOperator('matches', "BINARY", 20, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createMatchesNode(operands, line, column);
            }),
            createOperator('starts with', "BINARY", 20, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createStartsWithNode(operands, line, column);
            }),
            createOperator('ends with', "BINARY", 20, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createEndsWithNode(operands, line, column);
            }),
            createOperator('..', "BINARY", 25, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createRangeNode(operands, line, column);
            }),
            createOperator('+', "BINARY", 30, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createAddNode(operands, line, column);
            }),
            createOperator('-', "BINARY", 30, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createSubtractNode(operands, line, column);
            }),
            createOperator('~', "BINARY", 40, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createConcatNode(operands, line, column);
            }),
            createOperator('*', "BINARY", 60, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createMultiplyNode(operands, line, column);
            }),
            createOperator('/', "BINARY", 60, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createDivNode(operands, line, column);
            }),
            createOperator('//', "BINARY", 60, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createFloorDivNode(operands, line, column);
            }),
            createOperator('%', "BINARY", 60, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createModuloNode(operands, line, column);
            }),
            createOperator('**', "BINARY", 200, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createPowerNode(operands, line, column);
            }, "RIGHT"),
            createOperator('??', "BINARY", 300, (operands: [BaseExpressionNode, BaseExpressionNode], line: number, column: number) => {
                return createNullishCoalescingNode(operands, line, column);
            }, "RIGHT")
        ];
    }

    /**
     * @internal
     */
    private escapeFilterIsSafe(filterArgs: ArgumentsNode) {
        if (getChildrenCount(filterArgs) > 0) {
            let result: Array<string> = [];

            getChildren(filterArgs).forEach(([, arg]) => {
                if (arg.is("constant")) {
                    result = [arg.attributes.value as string];
                }
            });

            return result;
        } else {
            return ['html'];
        }
    }
}
