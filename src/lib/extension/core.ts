import {TwingExtension} from "../extension";
import {ForTokenParser} from "../token-parser/for";
import {createAndNode} from "../node/expression/binary/and";
import {ExtendsTokenParser} from "../token-parser/extends";
import {TwingTokenParserFrom} from "../token-parser/from";
import {MacroTokenParser} from "../token-parser/macro";
import {getChildren, getChildrenCount, Node} from "../node";
import {createInNode} from "../node/expression/binary/in";
import {TwingTokenParserIf} from "../token-parser/if";
import {SetTokenParser} from "../token-parser/set";
import {BlockTokenParser} from "../token-parser/block";
import {createGreaterThanNode} from "../node/expression/binary/greater";
import {createLessThanNode} from "../node/expression/binary/less";
import {TwingTokenParserInclude} from "../token-parser/include";
import {TwingTokenParserWith} from "../token-parser/with";
import {createNotNode} from "../node/expression/unary/not";
import {createNegativeNode} from "../node/expression/unary/neg";
import {createPositiveNode} from "../node/expression/unary/pos";
import {TwingFunction} from "../function";
import {TwingTokenParserSpaceless} from "../token-parser/spaceless";
import {createConcatNode} from "../node/expression/binary/concat";
import {createMultiplyNode} from "../node/expression/binary/mul";
import {createDivNode} from "../node/expression/binary/div";
import {createFloorDivNode} from "../node/expression/binary/floor-div";
import {createModuloNode} from "../node/expression/binary/mod";
import {createSubtractNode} from "../node/expression/binary/sub";
import {createAddNode} from "../node/expression/binary/add";
import {UseTokenParser} from "../token-parser/use";
import {TwingTokenParserEmbed} from "../token-parser/embed";
import {TwingTokenParserFilter} from "../token-parser/filter";
import {createRangeNode} from "../node/expression/binary/range";
import {TwingTokenParserImport} from "../token-parser/import";
import {DoTokenParser} from "../token-parser/do";
import {TwingTokenParserFlush} from "../token-parser/flush";
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
import {ExpressionNode} from "../node/expression";
import {createPowerNode} from "../node/expression/binary/power";
import {createDefinedTestNode} from "../node/expression/call/test/defined";
import {TwingTest} from "../test";
import {createMatchesNode} from "../node/expression/binary/matches";
import {createStartsWithNode} from "../node/expression/binary/starts-with";
import {createEndsWithNode} from "../node/expression/binary/ends-with";
import {TwingFilter} from "../filter";
import {Settings as DateTimeSettings} from 'luxon';
import {createDefaultFilterNode} from "../node/expression/call/filter/default";
import {TwingTokenParserDeprecated} from "../token-parser/deprecated";
import {TwingTokenParserApply} from "../token-parser/apply";
import {TwingOperator, TwingOperatorAssociativity, TwingOperatorType} from "../operator";
import {even} from "./core/tests/even";
import {odd} from "./core/tests/odd";
import {sameAs} from "./core/tests/same-as";
import {nullTest} from "./core/tests/null";
import {divisibleBy} from "./core/tests/divisible-by";
import {min} from "./core/functions/min";
import {max} from "./core/functions/max";
import {VerbatimTokenParser} from "../token-parser/verbatim";
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
import {AutoEscapeTokenParser} from "../token-parser/auto-escape";
import {TwingTokenParserSandbox} from "../token-parser/sandbox";
import {TwingBaseNodeVisitor} from "../base-node-visitor";
import {TwingNodeVisitorEscaper} from "../node-visitor/escaper";
import {TwingNodeVisitorSandbox} from "../node-visitor/sandbox";
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
import {TwingNodeVisitorMacroAutoImport} from "../node-visitor/macro-auto-import";
import {TwingTokenParserLine} from "../token-parser/line";
import {extname, basename} from "path";
import {PrimitiveEscapingStrategyResolver} from "../environment";
import {ArgumentsNode} from "../node/expression/arguments";

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
    constructor(defaultStrategy: string | false | PrimitiveEscapingStrategyResolver = 'html') {
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
            new TwingTokenParserApply(),
            new AutoEscapeTokenParser(),
            new BlockTokenParser(),
            new TwingTokenParserDeprecated(),
            new DoTokenParser(),
            new TwingTokenParserEmbed(),
            new ExtendsTokenParser(),
            new TwingTokenParserFilter(),
            new TwingTokenParserFlush(),
            new ForTokenParser(),
            new TwingTokenParserFrom(),
            new TwingTokenParserIf(),
            new TwingTokenParserImport(),
            new TwingTokenParserInclude(),
            new TwingTokenParserLine(),
            new MacroTokenParser(),
            new TwingTokenParserSandbox(),
            new SetTokenParser(),
            new TwingTokenParserSpaceless(),
            new UseTokenParser(),
            new VerbatimTokenParser(),
            new TwingTokenParserWith(),
        ] as any; //todo
    }

    getSourceMapNodeFactories(): TwingSourceMapNodeFactory[] {
        return [
            new TwingSourceMapNodeFactorySpaceless()
        ];
    }

    getNodeVisitors(): TwingBaseNodeVisitor[] {
        return [
            new TwingNodeVisitorEscaper(),
            new TwingNodeVisitorMacroAutoImport(),
            new TwingNodeVisitorSandbox()
        ];
    }

    getFilters() {
        return [
            new TwingFilter('abs', abs, []),
            new TwingFilter('batch', batch, [
                {name: 'size'},
                {name: 'fill', defaultValue: null},
                {name: 'preserve_keys', defaultValue: true}
            ]),
            new TwingFilter('capitalize', capitalize, [], {
                needs_template: true
            }),
            new TwingFilter('column', column, [
                {name: 'name'}
            ]),
            new TwingFilter('convert_encoding', convertEncoding, [
                {name: 'to'},
                {name: 'from'}
            ], {
                pre_escape: 'html',
                is_safe: ['html']
            }),
            new TwingFilter('date', date, [
                {name: 'format', defaultValue: null},
                {name: 'timezone', defaultValue: null}
            ], {
                needs_template: true
            }),
            new TwingFilter('date_modify', dateModify, [
                {name: 'modifier'}
            ], {
                needs_template: true
            }),
            new TwingFilter('default', defaultFilter, [
                {name: 'default'}
            ], {
                expression_factory: (node, _filterName, argumentsNode, line, column, tag) => {
                    return createDefaultFilterNode(node, argumentsNode, line, column, tag);
                }
            }),
            new TwingFilter('e', escape, [
                {name: 'strategy'},
                {name: 'charset'}
            ], {
                needs_template: true,
                is_safe_callback: this.escapeFilterIsSafe
            }),
            new TwingFilter('escape', escape, [
                {name: 'strategy'},
                {name: 'charset'}
            ], {
                needs_template: true,
                is_safe_callback: this.escapeFilterIsSafe
            }),
            new TwingFilter('filter', filter, [
                {name: 'array'},
                {name: 'arrow'}
            ]),
            new TwingFilter('first', firstFilter, []),
            new TwingFilter('format', format, []),
            new TwingFilter('join', join, [
                {name: 'glue', defaultValue: ''},
                {name: 'and', defaultValue: null}
            ]),
            new TwingFilter('json_encode', jsonEncode, [
                {name: 'options', defaultValue: null}
            ]),
            new TwingFilter('keys', arrayKeys, []),
            new TwingFilter('last', last, []),
            new TwingFilter('length', length, [], {
                needs_template: true
            }),
            new TwingFilter('lower', lower, [], {
                needs_template: true
            }),
            new TwingFilter('map', map, [
                {name: 'arrow'}
            ]),
            new TwingFilter('merge', mergeFilter, []),
            new TwingFilter('nl2br', nl2br, [], {
                pre_escape: 'html',
                is_safe: ['html']
            }),
            new TwingFilter('number_format', numberFormat, [
                {name: 'decimal'},
                {name: 'decimal_point'},
                {name: 'thousand_sep'}
            ], {
                needs_template: true
            }),
            new TwingFilter('raw', raw, [], {
                is_safe: ['all']
            }),
            new TwingFilter('reduce', reduce, [
                {name: 'arrow'},
                {name: 'initial', defaultValue: null}
            ]),
            new TwingFilter('replace', replace, [
                {name: 'from'}
            ]),
            new TwingFilter('reverse', reverseFilter, [
                {name: 'preserve_keys', defaultValue: false}
            ]),
            new TwingFilter('round', round, [
                {name: 'precision', defaultValue: 0},
                {name: 'method', defaultValue: 'common'}
            ]),
            new TwingFilter('slice', sliceFilter, [
                {name: 'start'},
                {name: 'length', defaultValue: null},
                {name: 'preserve_keys', defaultValue: false}
            ]),
            new TwingFilter('sort', sort, []),
            new TwingFilter('spaceless', spaceless, [], {
                is_safe: ['html']
            }),
            new TwingFilter('split', split, [
                {name: 'delimiter'},
                {name: 'limit'}
            ]),
            new TwingFilter('striptags', striptags, [
                {name: 'allowable_tags'}
            ]),
            new TwingFilter('title', title, []),
            new TwingFilter('trim', trim, [
                {name: 'character_mask', defaultValue: null},
                {name: 'side', defaultValue: 'both'}
            ]),
            new TwingFilter('upper', upper, []),
            new TwingFilter('url_encode', urlEncode, []),
        ];
    }

    getFunctions() {
        return [
            new TwingFunction('constant', constant, [
                {name: 'name'},
                {name: 'object', defaultValue: null}
            ], {
                needs_context: true
            }),
            new TwingFunction('cycle', cycle, [
                {name: 'values'},
                {name: 'position'}
            ]),
            new TwingFunction('date', dateFunction, [
                {name: 'date'},
                {name: 'timezone'}
            ], {
                needs_template: true
            }),
            new TwingFunction('dump', dump, [], {
                is_safe: ['html'],
                needs_context: true
            }),
            new TwingFunction('include', include, [
                {name: 'template'},
                {name: 'variables', defaultValue: {}},
                {name: 'with_context', defaultValue: true},
                {name: 'ignore_missing', defaultValue: false},
                {name: 'sandboxed', defaultValue: false}
            ], {
                needs_template: true,
                needs_context: true,
                needs_output_buffer: true,
                is_safe: ['all']
            }),
            new TwingFunction('max', max, []),
            new TwingFunction('min', min, []),
            new TwingFunction('random', random, [
                {name: 'values', defaultValue: null},
                {name: 'max', defaultValue: null}
            ], {
                needs_template: true
            }),
            new TwingFunction('range', range, [
                {name: 'low'},
                {name: 'high'},
                {name: 'step'}
            ]),
            new TwingFunction('source', source, [
                {name: 'name'},
                {name: 'ignore_missing', defaultValue: false}
            ], {
                needs_template: true,
                is_safe: ['all']
            }),
            new TwingFunction('template_from_string', templateFromString, [
                {name: 'template'},
                {name: 'name', defaultValue: null}
            ], {
                needs_template: true
            })
        ];
    }

    getTests(): Array<TwingTest> {
        return [
            new TwingTest('constant', null, [], {
                expression_factory: (node, _name, argumentsNode, line, column) => {
                    return createConstantTestNode(node, argumentsNode, line, column);
                }
            }),
            new TwingTest('divisible by', divisibleBy, []),
            new TwingTest('defined', null, [], {
                expression_factory: (node, _name, argumentsNode, line, column) => {
                    return createDefinedTestNode(node, argumentsNode, line, column);
                }
            }),
            new TwingTest('empty', empty, []),
            new TwingTest('even', even, []),
            new TwingTest('iterable', iterable, []),
            new TwingTest('none', nullTest, []),
            new TwingTest('null', nullTest, []),
            new TwingTest('odd', odd, []),
            new TwingTest('same as', sameAs, []),
        ];
    }

    getOperators(): TwingOperator[] {
        return [
            new TwingOperator('not', TwingOperatorType.UNARY, 50, (operands: [Node, Node], line: number, column: number) => {
                return createNotNode(operands[0], line, column);
            }),
            new TwingOperator('-', TwingOperatorType.UNARY, 500, (operands: [Node, Node], line: number, column: number) => {
                return createNegativeNode(operands[0], line, column);
            }),
            new TwingOperator('+', TwingOperatorType.UNARY, 500, (operands: [Node, Node], line: number, column: number) => {
                return createPositiveNode(operands[0], line, column);
            }),
            new TwingOperator('or', TwingOperatorType.BINARY, 10, (operands: [Node, Node], line: number, column: number) => {
                return createOrNode(operands, line, column);
            }),
            new TwingOperator('and', TwingOperatorType.BINARY, 15, (operands: [Node, Node], line: number, column: number) => {
                return createAndNode(operands, line, column);
            }),
            new TwingOperator('b-or', TwingOperatorType.BINARY, 16, (operands: [Node, Node], line: number, column: number) => {
                return createBitwiseOrNode(operands, line, column);
            }),
            new TwingOperator('b-xor', TwingOperatorType.BINARY, 17, (operands: [Node, Node], line: number, column: number) => {
                return createBitwiseXorNode(operands, line, column);
            }),
            new TwingOperator('b-and', TwingOperatorType.BINARY, 18, (operands: [Node, Node], line: number, column: number) => {
                return createBitwiseAndNode(operands, line, column);
            }),
            new TwingOperator('==', TwingOperatorType.BINARY, 20, (operands: [Node, Node], line: number, column: number) => {
                return createEqualNode(operands, line, column);
            }),
            new TwingOperator('!=', TwingOperatorType.BINARY, 20, (operands: [Node, Node], line: number, column: number) => {
                return createNotEqualToNode(operands, line, column);
            }),
            new TwingOperator('<', TwingOperatorType.BINARY, 20, (operands: [Node, Node], line: number, column: number) => {
                return createLessThanNode(operands, line, column);
            }),
            new TwingOperator('<=', TwingOperatorType.BINARY, 20, (operands: [Node, Node], line: number, column: number) => {
                return createLessThanOrEqualToNode(operands, line, column);
            }),
            new TwingOperator('>', TwingOperatorType.BINARY, 20, (operands: [Node, Node], line: number, column: number) => {
                return createGreaterThanNode(operands, line, column);
            }),
            new TwingOperator('>=', TwingOperatorType.BINARY, 20, (operands: [Node, Node], line: number, column: number) => {
                return createGreaterThanOrEqualToNode(operands, line, column);
            }),
            new TwingOperator('not in', TwingOperatorType.BINARY, 20, (operands: [Node, Node], line: number, column: number) => {
                return createNotInNode(operands, line, column);
            }),
            new TwingOperator('in', TwingOperatorType.BINARY, 20, (operands: [Node, Node], line: number, column: number) => {
                return createInNode(operands, line, column);
            }),
            new TwingOperator('matches', TwingOperatorType.BINARY, 20, (operands: [Node, Node], line: number, column: number) => {
                return createMatchesNode(operands, line, column);
            }),
            new TwingOperator('starts with', TwingOperatorType.BINARY, 20, (operands: [Node, Node], line: number, column: number) => {
                return createStartsWithNode(operands, line, column);
            }),
            new TwingOperator('ends with', TwingOperatorType.BINARY, 20, (operands: [Node, Node], line: number, column: number) => {
                return createEndsWithNode(operands, line, column);
            }),
            new TwingOperator('..', TwingOperatorType.BINARY, 25, (operands: [Node, Node], line: number, column: number) => {
                return createRangeNode(operands, line, column);
            }),
            new TwingOperator('+', TwingOperatorType.BINARY, 30, (operands: [Node, Node], line: number, column: number) => {
                return createAddNode(operands, line, column);
            }),
            new TwingOperator('-', TwingOperatorType.BINARY, 30, (operands: [Node, Node], line: number, column: number) => {
                return createSubtractNode(operands, line, column);
            }),
            new TwingOperator('~', TwingOperatorType.BINARY, 40, (operands: [Node, Node], line: number, column: number) => {
                return createConcatNode(operands, line, column);
            }),
            new TwingOperator('*', TwingOperatorType.BINARY, 60, (operands: [Node, Node], line: number, column: number) => {
                return createMultiplyNode(operands, line, column);
            }),
            new TwingOperator('/', TwingOperatorType.BINARY, 60, (operands: [Node, Node], line: number, column: number) => {
                return createDivNode(operands, line, column);
            }),
            new TwingOperator('//', TwingOperatorType.BINARY, 60, (operands: [Node, Node], line: number, column: number) => {
                return createFloorDivNode(operands, line, column);
            }),
            new TwingOperator('%', TwingOperatorType.BINARY, 60, (operands: [Node, Node], line: number, column: number) => {
                return createModuloNode(operands, line, column);
            }),
            // @ts-ignore
            new TwingOperator('is', TwingOperatorType.BINARY, 100, null),
            // @ts-ignore
            new TwingOperator('is not', TwingOperatorType.BINARY, 100, null),
            new TwingOperator('**', TwingOperatorType.BINARY, 200, (operands: [Node, Node], line: number, column: number) => {
                return createPowerNode(operands, line, column);
            }, TwingOperatorAssociativity.RIGHT),
            new TwingOperator('??', TwingOperatorType.BINARY, 300, (operands: [ExpressionNode, ExpressionNode], line: number, column: number) => {
                return createNullishCoalescingNode(operands, line, column);
            }, TwingOperatorAssociativity.RIGHT)
        ];
    }

    /**
     * @internal
     */
    private escapeFilterIsSafe(filterArgs: ArgumentsNode) {
        if (getChildrenCount(filterArgs) > 0) {
            let result: Array<string> = [];
            
            getChildren(filterArgs).forEach(([, arg]) => {
                if (arg.is("expression_constant")) {
                    result = [arg.attributes.value as string];
                }
            });

            return result;
        } else {
            return ['html'];
        }
    }
}
