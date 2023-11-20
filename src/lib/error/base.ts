import {TwingSource} from "../source";

export interface TwingBaseError<Name extends string> extends Error {
    readonly name: Name;
    readonly previous: any | undefined;
    readonly rootMessage: string;

    line: number | undefined;
    column: number | undefined;
    source: TwingSource | undefined;
    
    appendMessage(message: string): void;
}

export const createBaseError = <Name extends string>(
    name: Name, message: string, line?: number, column?: number, source?: TwingSource, previous?: any
): TwingBaseError<Name> => {
    const baseError = Error(message);

    baseError.name = name;

    const error = Object.create(baseError, {
        line: {
            get: () => line,
            set: (value: number) => {
                line = value;

                updateRepresentation();
            }
        },
        column: {
            value: column
        },
        source: {
            get: () => source,
            set: (value: TwingSource) => {
                source = value;

                updateRepresentation();
            }
        },
        previous: {
            value: previous
        },
        rootMessage: {
            value: message
        },
        appendMessage: {
            value: (value: string) => {
                message += value;

                updateRepresentation();
            }
        }
    });

    const updateRepresentation = () => {
        let representation = message;

        let dot = false;

        if (representation.slice(-1) === '.') {
            representation = representation.slice(0, -1);
            dot = true;
        }

        let questionMark = false;

        if (representation.slice(-1) === '?') {
            representation = representation.slice(0, -1);
            questionMark = true;
        }

        if (source) {
            representation += ` in "${source.name}"`;
        }

        if (line !== undefined) {
            representation += ` at line ${line}`;
        }

        if (column !== undefined) {
            representation += `, column ${column}`;
        }

        if (dot) {
            representation += '.';
        }

        if (questionMark) {
            representation += '?';
        }
        
        baseError.message = representation;
    };

    updateRepresentation();

    Error.captureStackTrace(error, createBaseError);

    return error;
}
