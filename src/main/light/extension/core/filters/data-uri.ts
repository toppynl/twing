import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

const encode = (data: string, mime: string): string => {
    const base64 = btoa(unescape(encodeURIComponent(data)));

    return `data:${mime};base64,${base64}`;
};

export const dataUri: TwingCallable<[data: string, mime?: string], string> = async (_executionContext, data, mime = 'text/plain') => {
    return encode(data, mime);
};

export const dataUriSynchronously: TwingSynchronousCallable<[data: string, mime?: string], string> = (_executionContext, data, mime = 'text/plain') => {
    return encode(data, mime);
};
