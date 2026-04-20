const TWIG_NAME_REGEX = /^[a-zA-Z_\u007f-\uffff][a-zA-Z0-9_\u007f-\uffff]*/;
const COMPONENT_NAME_REGEX = /^[A-Za-z0-9_:@\-.]+/;
const NEEDS_QUOTING_REGEX = /[-:@]/;
const WHITESPACE_REGEX = /[ \t\n\r\0\v]/;

type ComponentFrame = {
    name: string;
    hasDefaultBlock: boolean;
};

class PreLexer {
    private input = "";
    private length = 0;
    private position = 0;
    private line: number;
    private currentComponents: Array<ComponentFrame> = [];

    constructor(startingLine: number = 1) {
        this.line = startingLine;
    }

    preLexComponents(input: string): string {
        if (!input.includes("<twig:")) {
            return input;
        }

        this.input = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        this.length = this.input.length;
        this.position = 0;

        let output = "";
        let inTwigEmbed = false;

        while (this.position < this.length) {
            if (this.consume("{% verbatim %}")) {
                output += "{% verbatim %}";
                output += this.consumeUntil("{% endverbatim %}");
                this.consume("{% endverbatim %}");
                output += "{% endverbatim %}";

                if (this.position === this.length) {
                    break;
                }
            }

            if (this.consume("{#")) {
                output += "{#";
                output += this.consumeUntil("#}");
                this.consume("#}");
                output += "#}";

                if (this.position === this.length) {
                    break;
                }
            }

            if (this.consume("{% embed")) {
                inTwigEmbed = true;
                output += "{% embed";
                output += this.consumeUntil("%}");

                continue;
            }

            if (this.consume("{% endembed %}")) {
                inTwigEmbed = false;
                output += "{% endembed %}";

                continue;
            }

            const isTwigHtmlOpening = this.consume("<twig:");
            let isTraditionalBlockOpening = false;

            if (!isTwigHtmlOpening && this.currentComponents.length !== 0) {
                isTraditionalBlockOpening = this.consume("{% block");
            }

            if (isTwigHtmlOpening || isTraditionalBlockOpening) {
                const componentName = isTraditionalBlockOpening ? "block" : this.consumeComponentName();

                if (componentName === "block") {
                    const top = this.currentComponents[this.currentComponents.length - 1];

                    if (this.currentComponents.length !== 0 && top.hasDefaultBlock && !inTwigEmbed) {
                        output += "{% endblock %}";
                        top.hasDefaultBlock = false;
                    }

                    if (isTraditionalBlockOpening) {
                        output += "{% block";
                        const stringUntilClosingTag = this.consumeUntil("%}");
                        output += stringUntilClosingTag;

                        const isBlockSelfClosing = stringUntilClosingTag.trim().replace(TWIG_NAME_REGEX, "") !== "";

                        if (isBlockSelfClosing && this.consume("%}")) {
                            output += "%}";
                        } else {
                            output += this.consumeUntilEndBlock();
                        }

                        continue;
                    }

                    output += this.consumeBlock(componentName);

                    continue;
                }

                const top = this.currentComponents[this.currentComponents.length - 1];

                if (this.currentComponents.length !== 0 && !top.hasDefaultBlock) {
                    output += "{% block content %}";
                    top.hasDefaultBlock = true;
                }

                const attributes = this.consumeAttributes(componentName);
                const isSelfClosing = this.consume("/>");

                if (!isSelfClosing) {
                    this.consume(">");
                    this.currentComponents.push({name: componentName, hasDefaultBlock: false});
                }

                if (isSelfClosing) {
                    output += `{{ component('${componentName}'${attributes ? `, { ${attributes} }` : ""}) }}`;
                } else {
                    output += `{% component '${componentName}'${attributes ? ` with { ${attributes} }` : ""} %}`;
                }

                continue;
            }

            if (this.currentComponents.length !== 0 && this.check("</twig:")) {
                this.consume("</twig:");
                const closingComponentName = this.consumeComponentName();
                this.consume(">");

                const lastComponent = this.currentComponents.pop()!;
                const lastComponentName = lastComponent.name;

                if (closingComponentName !== lastComponentName) {
                    throw new SyntaxError(
                        `Expected closing tag '</twig:${lastComponentName}>' but found '</twig:${closingComponentName}>' at line ${this.line}.`
                    );
                }

                if (lastComponent.hasDefaultBlock) {
                    output += "{% endblock %}";
                }

                output += "{% endcomponent %}";

                continue;
            }

            const char = this.input[this.position];
            if (char === "\n") {
                this.line++;
            }

            const topFrame = this.currentComponents[this.currentComponents.length - 1];

            if (
                this.currentComponents.length !== 0 &&
                !topFrame.hasDefaultBlock &&
                /\S/.test(char) &&
                !this.check("{% block")
            ) {
                topFrame.hasDefaultBlock = true;
                output += "{% block content %}";
            }

            output += char;
            this.consumeChar();
        }

        if (this.currentComponents.length !== 0) {
            const lastName = this.currentComponents[this.currentComponents.length - 1].name;
            throw new SyntaxError(`Expected closing tag "</twig:${lastName}>" not found at line ${this.line}.`);
        }

        return output;
    }

    private consumeComponentName(customExceptionMessage?: string): string {
        const remaining = this.input.slice(this.position);
        const match = remaining.match(COMPONENT_NAME_REGEX);

        if (match) {
            this.position += match[0].length;
            return match[0];
        }

        throw new SyntaxError(
            customExceptionMessage ?? `Expected component name when resolving the "<twig:" syntax at line ${this.line}.`
        );
    }

    private consumeAttributes(componentName: string): string {
        const attributes: Array<string> = [];

        while (this.position < this.length && !this.check(">") && !this.check("/>")) {
            this.consumeWhitespace();

            if (this.check(">") || this.check("/>")) {
                break;
            }

            if (this.check("{{...") || this.check("{{ ...")) {
                this.consume("{{...");
                this.consume("{{ ...");
                attributes.push("..." + this.consumeUntil("}}").trim());
                this.consume("}}");

                continue;
            }

            let isAttributeDynamic = false;

            this.consumeWhitespace();

            if (this.check(":")) {
                this.consume(":");
                isAttributeDynamic = true;
            }

            const message = `Expected attribute name when parsing the "<twig:${componentName}" syntax at line ${this.line}.`;
            const key = this.consumeComponentName(message);

            if (!this.check("=")) {
                this.consumeWhitespace();

                if (isAttributeDynamic) {
                    throw new SyntaxError(
                        `Expected "=" after ":${key}" when parsing the "<twig:${componentName}" syntax at line ${this.line}.`
                    );
                }

                const formattedKey = NEEDS_QUOTING_REGEX.test(key) ? `'${key}'` : key;

                attributes.push(`${formattedKey}: true`);
                this.consumeWhitespace();

                continue;
            }

            this.expectAndConsumeChar("=");
            const quote = this.consumeChar(["'", '"']);

            let attributeValue: string;

            if (isAttributeDynamic) {
                attributeValue = this.consumeUntil(quote);
            } else {
                attributeValue = this.consumeAttributeValue(quote);
            }

            const formattedKey = NEEDS_QUOTING_REGEX.test(key) ? `'${key}'` : key;
            const formattedValue = attributeValue === "" ? "''" : attributeValue;

            attributes.push(`${formattedKey}: ${formattedValue}`);

            this.expectAndConsumeChar(quote);
            this.consumeWhitespace();
        }

        return attributes.join(", ");
    }

    private consume(str: string): boolean {
        if (this.input.startsWith(str, this.position)) {
            this.position += str.length;
            return true;
        }

        return false;
    }

    private consumeChar(validChars?: Array<string>): string {
        if (this.position >= this.length) {
            throw new SyntaxError(`Unexpected end of input at line ${this.line}.`);
        }

        const char = this.input[this.position];

        if (validChars && !validChars.includes(char)) {
            throw new SyntaxError(
                `Expected one of [.${validChars.join("")}] but found '${char}' at line ${this.line}.`
            );
        }

        this.position++;
        return char;
    }

    private consumeUntil(endString: string): string {
        const endPosition = this.input.indexOf(endString, this.position);

        if (endPosition === -1) {
            const start = this.position;
            this.position = this.length;
            return this.input.slice(start);
        }

        const content = this.input.slice(this.position, endPosition);
        this.line += (content.match(/\n/g) || []).length;
        this.position = endPosition;

        return content;
    }

    private consumeWhitespace(): void {
        let end = this.position;

        while (end < this.length && WHITESPACE_REGEX.test(this.input[end])) {
            end++;
        }

        const whitespace = this.input.slice(this.position, end);
        this.line += (whitespace.match(/\n/g) || []).length;
        this.position = end;

        if (this.check("#")) {
            this.consume("#");
            this.consumeUntil("\n");
            this.consumeWhitespace();
        }
    }

    private expectAndConsumeChar(char: string): void {
        if (char.length !== 1) {
            throw new Error("Expected a single character.");
        }

        if (this.position >= this.length) {
            throw new SyntaxError(`Expected '${char}' but reached the end of the file at line ${this.line}.`);
        }

        if (this.input[this.position] !== char) {
            throw new SyntaxError(
                `Expected '${char}' but found '${this.input[this.position]}' at line ${this.line}.`
            );
        }

        this.position++;
    }

    private check(chars: string): boolean {
        return this.position + chars.length <= this.length &&
            this.input.substr(this.position, chars.length) === chars;
    }

    private consumeBlock(componentName: string): string {
        const attributes = this.consumeAttributes(componentName);
        this.consume(">");

        let blockName = "";
        for (const attr of attributes.split(", ")) {
            const [key, value] = attr.split(": ");
            if (key === "name") {
                blockName = value.replace(/^'|'$/g, "");
                break;
            }
        }

        if (!blockName) {
            throw new SyntaxError(`Expected block name at line ${this.line}.`);
        }

        let output = `{% block ${blockName} %}`;

        const closingTag = "</twig:block>";
        if (this.input.indexOf(closingTag, this.position) === -1) {
            throw new SyntaxError(`Expected closing tag '${closingTag}' for block '${blockName}' at line ${this.line}.`);
        }

        const blockContents = this.consumeUntilEndBlock();

        const subLexer = new PreLexer(this.line);
        output += subLexer.preLexComponents(blockContents);

        this.consume(closingTag);
        output += "{% endblock %}";

        return output;
    }

    private consumeUntilEndBlock(): string {
        const start = this.position;

        let depth = 1;
        let inComment = false;

        while (this.position < this.length) {
            if (inComment && this.input.substr(this.position, 2) === "#}") {
                inComment = false;
            }

            if (!inComment && this.input.substr(this.position, 2) === "{#") {
                inComment = true;
            }

            if (!inComment && this.input.substr(this.position, 13) === "</twig:block>") {
                if (depth === 1) {
                    break;
                }
                depth--;
            }

            if (!inComment && this.input.substr(this.position, 14) === "{% endblock %}") {
                if (depth === 1) {
                    this.position += 14;
                    break;
                }
                depth--;
            }

            if (!inComment && this.input.substr(this.position, 11) === "<twig:block") {
                depth++;
            }

            if (!inComment && this.input.substr(this.position, 8) === "{% block") {
                depth++;
            }

            if (this.input[this.position] === "\n") {
                this.line++;
            }

            this.position++;
        }

        return this.input.slice(start, this.position);
    }

    private consumeAttributeValue(quote: string): string {
        const parts: Array<string> = [];
        let currentPart = "";

        while (this.position < this.length) {
            if (this.check(quote)) {
                break;
            }

            if (this.input[this.position] === "\n") {
                this.line++;
            }

            if (this.check("{{")) {
                if (currentPart !== "") {
                    parts.push(`'${currentPart.replace(/'/g, "\\'")}'`);
                    currentPart = "";
                }

                this.consume("{{");
                this.consumeWhitespace();
                parts.push(`(${this.consumeUntil("}}").replace(/\s+$/, "")})`);
                this.expectAndConsumeChar("}");
                this.expectAndConsumeChar("}");

                continue;
            }

            currentPart += this.input[this.position];
            this.position++;
        }

        if (currentPart !== "") {
            parts.push(`'${currentPart.replace(/'/g, "\\'")}'`);
        }

        return parts.join("~");
    }
}

export const preLexComponents = (input: string, startingLine: number = 1): string => {
    return new PreLexer(startingLine).preLexComponents(input);
};
