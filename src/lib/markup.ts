import {iconv} from "./helpers/iconv";

export interface Markup {
    readonly content: Buffer;
    readonly charset: string;
    readonly count: number;

    toString: () => string;
    toJSON: () => string;
}

export const createMarkup = (
    content: Buffer,
    charset: string
) => {
    const markup: Markup = {
        get content() {
            return content;
        },
        get charset() {
            return charset;
        },
        get count() {
            const contentAsString = iconv(charset, 'utf-8', content).toString();

            return contentAsString.length;
        },
        toString() {
            return content.toString();
        },
        toJSON() {
            return content.toString();
        }
    };

    return markup;
};

/**
 * Marks a content as safe.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export class TwingMarkup {
    private content: Buffer;
    private charset: string;

    constructor(content: string, charset: string) {
        this.content = Buffer.from(content);
        this.charset = charset;
    }

    toString() {
        return this.content.toString();
    }

    count(): number {
        let content = iconv(this.charset, 'utf-8', this.content).toString();

        return content.length;
    }

    toJSON() {
        return this.content.toString();
    }
}
