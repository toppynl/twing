import type {TwingCallable, TwingSynchronousCallable} from "@toppynl/twing";
import {resolveCountryTimezones} from "../shared/country-timezones";

export const countryTimezones: TwingCallable = async (_ctx, value: string) =>
    resolveCountryTimezones(value);

export const countryTimezonesSynchronously: TwingSynchronousCallable = (_ctx, value: string) =>
    resolveCountryTimezones(value);
