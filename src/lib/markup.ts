import {iconv} from "./helpers/iconv";

export interface TwingMarkup {
    readonly charset: string;
    readonly content: string;
    readonly count: number;

    toJSON: () => string; // todo: used somewhere?
    toString: () => string;
}

export const isAMarkup = (candidate: any): candidate is TwingMarkup => {
    return candidate !== null 
        && candidate !== undefined
        && (candidate as TwingMarkup).charset !== undefined
        && (candidate as TwingMarkup).content !== undefined
        && (candidate as TwingMarkup).count !== undefined // todo: we should not test getter values but actual property existence
        && (candidate as TwingMarkup).toJSON !== undefined
        && (candidate as TwingMarkup).toString !== undefined;
};

export const createMarkup = (
    content: string,
    charset: string = 'UTF-8'
): TwingMarkup => {
    return {
        get content() {
            return content;
        },
        get charset() {
            return charset;
        },
        get count() {
            const contentAsString = iconv(charset, 'utf-8', Buffer.from(content)).toString();

            return contentAsString.length;
        },
        toString() {
            return content.toString();
        },
        toJSON() {
            return content.toString();
        }
    };
};
