/**
 * 延迟函数
 * @param ms 延迟的毫秒数
 * @returns Promise
 */
export declare const delay: (ms: number) => Promise<void>;
/**
 * 带超时的 fetch
 * @param url 请求地址
 * @param options fetch 配置项
 * @param timeout 超时时间（毫秒）
 * @returns Promise<Response>
 */
export declare const fetchWithTimeout: (url: string, options: RequestInit | undefined, timeout: number) => Promise<Response>;
//# sourceMappingURL=http.d.ts.map