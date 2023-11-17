import {PassThrough, Readable} from "stream";

interface TwingOutputHandler {
    getContent(): string;

    write(value: string): void;

    append(value: string): void;
}

const createOutputHandler = (): TwingOutputHandler => {
    let content: string = '';

    return {
        getContent: () => {
            return content;
        },
        write: (value) => {
            content = value;
        },
        append: (value) => {
            content += value;
        }
    };
};

export interface TwingOutputBuffer {
    readonly outputStream: Readable;
    
    echo(string: any): string | void;

    /**
     * Clean (erase) the output buffer
     *
     * In human terms: empties the top-most buffer
     *
     * ┌─────────┐    ┌─────────┐
     * │   oof   │    │         │
     * ├─────────┤    ├─────────┤
     * │   bar   │ => │   bar   │
     * ├─────────┤    ├─────────┤
     * │   foo   │    │   foo   │ => true
     * └─────────┘    └─────────┘
     *
     */
    clean(): boolean;

    /**
     * Clean the output buffer, and delete active output buffer
     *
     * In human terms: removes the top-most buffer
     *
     * ```text
     * ┌─────────┐
     * │   oof   │
     * ├─────────┤    ┌─────────┐
     * │   bar   │ -> │   bar   │
     * ├─────────┤    ├─────────┤
     * │   foo   │    │   foo   │ => true
     * └─────────┘    └─────────┘
     * ```
     * 
     * @returns {boolean}
     */
    endAndClean(): boolean;

    /**
     * Flush (send) the output buffer, and delete current output buffer
     *
     * In human terms: appends the top-most buffer to the second-top-most buffer and removes the top-most buffer
     *
     * ```text
     * ┌─────────┐
     * │   oof   │
     * ├─────────┤    ┌─────────┐
     * │   bar   │ -> │  baroof │
     * ├─────────┤    ├─────────┤
     * │   foo   │    │   foo   │ => true
     * └─────────┘    └─────────┘
     * ```
     *
     * @returns {boolean}
     */
    endAndFlush(): boolean;

    /**
     * Flush (send) contents of the output buffer. The last buffer content is sent to next buffer
     *
     * In human terms: appends the top-most buffer to the second-top-most buffer and empties the top-most buffer
     *
     * ┌─────────┐    ┌─────────┐
     * │   oof   │    │         │
     * ├─────────┤    ├─────────┤
     * │   bar   │ => │  baroof │
     * ├─────────┤    ├─────────┤
     * │   foo   │    │   foo   │ => true
     * └─────────┘    └─────────┘
     *
     */
    flush(): boolean;

    /**
     * Get active buffer contents and delete active output buffer
     *
     * In human terms: removes the top-most buffer and returns its content
     *
     * ```text
     * ┌─────────┐
     * │   oof   │
     * ├─────────┤    ┌─────────┐
     * │   bar   │ -> │   bar   │
     * ├─────────┤    ├─────────┤
     * │   foo   │    │   foo   │ => "oof"
     * └─────────┘    └─────────┘
     * ```
     * 
     * @returns {string}
     */
    getAndClean(): string,

    /**
     * Get active buffer contents, flush (send) the output buffer, and delete active output buffer
     *
     * In human terms: appends the top-most buffer to the second-top-most buffer, removes the top-most buffer and returns its content
     *
     * ┌─────────┐
     * │   oof   │
     * ├─────────┤    ┌─────────┐
     * │   bar   │ -> │  baroof │
     * ├─────────┤    ├─────────┤
     * │   foo   │    │   foo   │ => oof
     * └─────────┘    └─────────┘
     *
     * @returns {string}
     */
    getAndFlush(): string;

    /**
     * Gets the contents of the output buffer without clearing it.
     *
     * In human terms: returns the content of the top-most buffer
     *
     * ┌─────────┐
     * │   oof   │
     * ├─────────┤
     * │   bar   │
     * ├─────────┤
     * │   foo   │ => "oof"
     * └─────────┘
     *
     * @returns {string}
     */
    getContents(): string;

    /**
     * Return the nesting level of the output buffering mechanism
     *
     * @returns {number}
     */
    getLevel(): number;

    /**
     * Turn on Output Buffering (specifying an optional output handler).
     *
     * @returns {boolean}
     */
    start(): boolean;
}

export const createOutputBuffer = (): TwingOutputBuffer => {
    const handlers: Array<TwingOutputHandler> = [];
    const outputStream = new PassThrough();

    /**
     * Append the string to the top-most buffer or write it to the output stream if there is none
     *
     * @param {string} string | void
     */
    const outputWrite = (string: string): void => {
        const active = getActive();
        
        if (active) {
            active.append(string);
        } else {
            outputStream.write(string);
        }
    };

    const getActive = (): TwingOutputHandler | null => {
        if (handlers.length > 0) {
            return handlers[handlers.length - 1];
        } else {
            return null;
        }
    };

    const outputBuffer: TwingOutputBuffer = {
        get outputStream() {
            return outputStream;  
        },
        clean: () => {
            const active = getActive();

            if (!active) {
                throw new Error('Failed to clean buffer: no buffer to clean.');
            }

            active.write('');

            return true;
        },
        echo(value: any) {
            if (typeof value === 'boolean') {
                value = (value === true) ? '1' : '';
            } 
            else if (typeof value === "number") {
                value = String(value);
            }
            else if (value === null || value === undefined) {
                value = '';
            }

            return outputWrite(value);
        },
        endAndClean: () => {
            outputBuffer.clean();
            handlers.pop();

            return true;
        },
        endAndFlush: () => {
            if (!getActive()) {
                throw new Error('Failed to delete and flush buffer: no buffer to delete or flush.');
            }

            outputBuffer.flush();

            handlers.pop();

            return true;
        },
        flush: () => {
            let active = getActive();

            if (!active) {
                throw new Error('Failed to flush buffer: no buffer to flush.');
            }

            handlers.pop();

            outputWrite(active.getContent());

            active.write('');

            handlers.push(active);

            return true;
        },
        getAndClean: () => {
            const content = outputBuffer.getContents();

            outputBuffer.endAndClean();

            return content;
        },
        getAndFlush: () => {
            const content = outputBuffer.getContents();

            outputBuffer.endAndFlush();

            return content;
        },
        getContents: () => {
            const activeOutputHandler = getActive();
            
            return activeOutputHandler ? activeOutputHandler.getContent() : '';
        },
        getLevel: () => {
            return handlers.length;
        },
        start: () => {
            const handler = createOutputHandler();

            handlers.push(handler);

            return true;
        }
    };

    return outputBuffer;
};
