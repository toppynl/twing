import type {TwingMarkup} from "../../../markup";
import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

const toSlug = (value: string | TwingMarkup, separator: string): string => {
    return value.toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, separator)
        .replace(new RegExp(`^\\${separator}+|\\${separator}+$`, 'g'), '');
};

export const slug: TwingCallable<[value: string | TwingMarkup, separator?: string], string> = async (_executionContext, value, separator = '-') => {
    return toSlug(value, separator);
};

export const slugSynchronously: TwingSynchronousCallable<[value: string | TwingMarkup, separator?: string], string> = (_executionContext, value, separator = '-') => {
    return toSlug(value, separator);
};
