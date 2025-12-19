/**
 * ESB 响应数据结构
 */
interface ESBResponse {
    RESPONSE?: {
        RETURN_DATA?: {
            success: boolean;
            [key: string]: any;
        };
        [key: string]: any;
    };
    [key: string]: any;
}
/**
 * 调用结果 - 成功
 */
interface CallSuccessResult {
    success: true;
    data: ESBResponse;
}
/**
 * 调用结果 - 失败
 */
interface CallFailureResult {
    success: false;
    error: Error;
}
/**
 * 调用结果联合类型
 */
type CallResult = CallSuccessResult | CallFailureResult;
/**
 * 配置接口（如果需要 this.config）
 */
interface RetryConfig {
    retryDelay: number;
}
/**
 * 带重试的 HTTP 调用
 * @param url 请求地址
 * @param payload 请求体（对象或字符串）
 * @param retryTimes 重试次数
 * @param config 配置对象（包含 retryDelay）
 * @returns 调用结果
 */
export declare const callWithRetry: (url: string, payload: Record<string, any> | string, retryTimes?: number, config?: RetryConfig) => Promise<CallResult>;
export {};
//# sourceMappingURL=esb.service.d.ts.map