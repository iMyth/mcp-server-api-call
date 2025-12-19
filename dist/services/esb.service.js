import { fetchWithTimeout, delay } from '@/utils/http';
/**
 * 带重试的 HTTP 调用
 * @param url 请求地址
 * @param payload 请求体（对象或字符串）
 * @param retryTimes 重试次数
 * @param config 配置对象（包含 retryDelay）
 * @returns 调用结果
 */
export const callWithRetry = async (url, payload, retryTimes = 1, config) => {
    let lastError = new Error('Unknown error');
    for (let i = 0; i < retryTimes; i++) {
        try {
            const bodyContent = typeof payload === 'string' ? payload : JSON.stringify(payload);
            const response = await fetchWithTimeout(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                body: bodyContent
            }, 5000 // 5e3 改为更清晰的 5000
            );
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`ESB returned status ${response.status}: ${errorText}`);
            }
            const result = await response.json();
            if (!result?.RESPONSE?.RETURN_DATA?.success) {
                throw new Error(`ESB business error: ${JSON.stringify(result, null, 2)}`);
            }
            return { success: true, data: result };
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (i < retryTimes - 1 && config?.retryDelay) {
                await delay(config.retryDelay * (i + 1));
            }
        }
    }
    return { success: false, error: lastError };
};
