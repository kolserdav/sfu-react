declare enum LogLevel {
    log = 0,
    info = 1,
    warn = 2,
    error = 3
}
export declare const log: (type: keyof typeof LogLevel, text: string, data?: any) => void;
export declare const getTarget: (pathname: string) => string;
export declare const parseMessage: (message: string) => object;
export declare const parseQueryString: (query: string) => Record<string, string> | null;
export {};
