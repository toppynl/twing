export interface TwingMarkup {
    /**
     * @deprecated
     */
    readonly charset: string;
    readonly content: string;
    /**
     * @deprecated
     */
    readonly count: number;
    /**
     * @deprecated
     */
    toJSON: () => string; // todo: used somewhere?
    /**
     * @deprecated
     */
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
            return content.length;
        },
        toString() {
            return content.toString();
        },
        toJSON() {
            return content.toString();
        }
    };
};
