
type AnyFunction = (...args: any)=>any;

// Provides similar functionality to the NPM debounce library
const debounce = <T extends AnyFunction> (callback: T, timeoutMs = 100) => {
    let timeout: undefined|ReturnType<typeof setTimeout> = undefined;

    return (...args: Parameters<T>) => {
        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            timeout = undefined;
            callback(...args);
        }, timeoutMs);
    };
};

export default debounce;