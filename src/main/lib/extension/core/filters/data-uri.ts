import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

const encode = (data: string | Buffer, mime: string): string => {
    const base64 = Buffer.isBuffer(data)
        ? data.toString('base64')
        : Buffer.from(data).toString('base64');

    return `data:${mime};base64,${base64}`;
};

export const dataUri: TwingCallable<[data: string | Buffer, mime?: string], string> = async (_executionContext, data, mime = 'text/plain') => {
    return encode(data, mime);
};

export const dataUriSynchronously: TwingSynchronousCallable<[data: string | Buffer, mime?: string], string> = (_executionContext, data, mime = 'text/plain') => {
    return encode(data, mime);
};
