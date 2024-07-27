import {iconv} from "../../../helpers/iconv";
import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

export const convertEncoding: TwingCallable<[
    value: string | Buffer,
    to: string,
    from: string
], Buffer> = (_executionContext, value, to, from) => {
    return Promise.resolve(iconv(from, to, Buffer.from(value)));
};

export const convertEncodingSynchronously: TwingSynchronousCallable<[
    value: string | Buffer,
    to: string,
    from: string
], Buffer> = (_executionContext, value, to, from) => {
    return iconv(from, to, Buffer.from(value));
};
