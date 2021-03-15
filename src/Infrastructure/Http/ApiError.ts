/** @interface ApiError */
export interface ApiError {
    message: string;
    code: string;
    status: number;
    raw: Error;
    params: unknown;
}