import {iconv} from "./helpers/iconv";

export interface TwingMarkup {
    readonly charset: string;
    readonly content: Buffer;
    readonly count: number;

    toJSON: () => string;
    toString: () => string;
}

export const isAMarkup = (candidate: any): candidate is TwingMarkup => {
    return (candidate as TwingMarkup).charset !== undefined
        && (candidate as TwingMarkup).content !== undefined
        && (candidate as TwingMarkup).count !== undefined
        && (candidate as TwingMarkup).toJSON !== undefined
        && (candidate as TwingMarkup).toString !== undefined;
};

export const createMarkup = (
    content: Buffer,
    charset: string
) => {
    const markup: TwingMarkup = {
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
