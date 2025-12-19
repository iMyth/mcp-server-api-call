import { fetchWithTimeout, delay } from '@/utils/http'

/**
 * ESB 响应数据结构
 */
interface ESBResponse {
  RESPONSE?: {
    RETURN_DATA?: {
      success: boolean
      [key: string]: any
    }
    [key: string]: any
  }
  [key: string]: any
}

/**
 * 调用结果 - 成功
 */
interface CallSuccessResult {
  success: true
  data: ESBResponse
}

/**
 * 调用结果 - 失败
 */
interface CallFailureResult {
  success: false
  error: Error
}

/**
 * 调用结果联合类型
 */
type CallResult = CallSuccessResult | CallFailureResult

/**
 * 配置接口（如果需要 this.config）
 */
interface RetryConfig {
  retryDelay: number
}

/**
 * 带重试的 HTTP 调用
 * @param url 请求地址
 * @param payload 请求体（对象或字符串）
 * @param retryTimes 重试次数
 * @param config 配置对象（包含 retryDelay）
 * @returns 调用结果
 */
export const callWithRetry = async (
  url: string,
  payload: Record<string, any> | string,
  retryTimes: number = 1,
  config?: RetryConfig
): Promise<CallResult> => {
  let lastError: Error = new Error('Unknown error')

  for (let i = 0; i < retryTimes; i++) {
    try {
      const bodyContent =
        typeof payload === 'string' ? payload : JSON.stringify(payload)

      const response = await fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: bodyContent
        },
        5000 // 5e3 改为更清晰的 5000
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`ESB returned status ${response.status}: ${errorText}`)
      }

      const result: ESBResponse = await response.json()

      if (!result?.RESPONSE?.RETURN_DATA?.success) {
        throw new Error(
          `ESB business error: ${JSON.stringify(result, null, 2)}`
        )
      }

      return { success: true, data: result }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (i < retryTimes - 1 && config?.retryDelay) {
        await delay(config.retryDelay * (i + 1))
      }
    }
  }

  return { success: false, error: lastError }
}
