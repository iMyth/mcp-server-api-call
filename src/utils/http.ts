/**
 * 延迟函数
 * @param ms 延迟的毫秒数
 * @returns Promise
 */
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 带超时的 fetch
 * @param url 请求地址
 * @param options fetch 配置项
 * @param timeout 超时时间（毫秒）
 * @returns Promise<Response>
 */
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number
): Promise<Response> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}
