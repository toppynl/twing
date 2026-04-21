import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

const toSlug = (value: string, separator: string): string => {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, separator)
        .replace(new RegExp(`^\\${separator}+|\\${separator}+$`, 'g'), '');
};

export const slug: TwingCallable<[value: string, separator?: string], string> = async (_executionContext, value, separator = '-') => {
    return toSlug(value, separator);
};

export const slugSynchronously: TwingSynchronousCallable<[value: string, separator?: string], string> = (_executionContext, value, separator = '-') => {
    return toSlug(value, separator);
};
