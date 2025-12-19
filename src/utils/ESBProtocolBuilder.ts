/**
 * ESB 协议构造器
 * 用于构建符合 ESB 规范的请求数据格式
 * Node.js 环境
 */

// ============ 类型定义 ============

interface ESBAttrs {
  App_ID: string
  Target_ID: string
  Application_ID: string
  Transaction_ID: string
}

interface Attachment {
  attachmentName: string
  attachmentDesc: string
}

interface WorkOrderHead {
  jobTitle: string
  businessSystem: string
  proposeUser: string
  jobDesc: string
  fbk13: string
  eventId: string
  attachmentList: Attachment[]
}

interface RequestData {
  SendData: {
    Head: WorkOrderHead
  }
  SendHead: Record<string, any>
  SendURL: Record<string, any>
  Operation: string
  Type: string
}

interface ESBRequest {
  REQUEST: {
    ESB_ATTRS: ESBAttrs
    REQUEST_DATA: RequestData
  }
}

// ============ 主类 ============

class ESBProtocolBuilder {
  private request: ESBRequest

  constructor() {
    this.request = {
      REQUEST: {
        ESB_ATTRS: {
          App_ID: 'VOSA',
          Target_ID: 'WOMS',
          Application_ID: '00020000000002',
          Transaction_ID: ''
        },
        REQUEST_DATA: {
          SendData: {
            Head: {
              jobTitle: '',
              businessSystem: '',
              proposeUser: '',
              jobDesc: '',
              fbk13: '',
              eventId: '',
              attachmentList: []
            }
          },
          SendHead: {},
          SendURL: {},
          Operation: 'Z_WORK_ORDER_CREATE_NEW',
          Type: 'Z_WORK_ORDER_CREATE_NEW'
        }
      }
    }
  }

  /**
   * 设置 ESB 属性
   * @param attrs - ESB 属性对象
   * @returns {ESBProtocolBuilder}
   */
  setESBAttrs(attrs: Partial<ESBAttrs>): ESBProtocolBuilder {
    this.request.REQUEST.ESB_ATTRS = {
      ...this.request.REQUEST.ESB_ATTRS,
      ...attrs
    }
    return this
  }

  /**
   * 设置 App ID
   * @param appId
   * @returns {ESBProtocolBuilder}
   */
  setAppId(appId: string): ESBProtocolBuilder {
    this.request.REQUEST.ESB_ATTRS.App_ID = appId
    return this
  }

  /**
   * 设置 Event ID
   * @param eventId
   * @returns {ESBProtocolBuilder}
   */
  setEventId(eventId: string): ESBProtocolBuilder {
    this.request.REQUEST.REQUEST_DATA.SendData.Head.eventId = eventId
    return this
  }

  /**
   * 设置 Target ID
   * @param targetId
   * @returns {ESBProtocolBuilder}
   */
  setTargetId(targetId: string): ESBProtocolBuilder {
    this.request.REQUEST.ESB_ATTRS.Target_ID = targetId
    return this
  }

  /**
   * 设置 Application ID
   * @param applicationId
   * @returns {ESBProtocolBuilder}
   */
  setApplicationId(applicationId: string): ESBProtocolBuilder {
    this.request.REQUEST.ESB_ATTRS.Application_ID = applicationId
    return this
  }

  /**
   * 生成新的 Application ID
   * @returns {ESBProtocolBuilder}
   */
  generateApplicationId(): ESBProtocolBuilder {
    this.request.REQUEST.ESB_ATTRS.Application_ID =
      this._generateApplicationId()
    return this
  }

  /**
   * 设置或生成 Transaction ID
   * @param transactionId - 如果不提供则自动生成
   * @returns {ESBProtocolBuilder}
   */
  setTransactionId(transactionId?: string): ESBProtocolBuilder {
    this.request.REQUEST.ESB_ATTRS.Transaction_ID =
      transactionId || this._generateUUID()
    return this
  }

  /**
   * 设置工单标题
   * @param jobTitle
   * @returns {ESBProtocolBuilder}
   */
  setJobTitle(jobTitle: string): ESBProtocolBuilder {
    this.request.REQUEST.REQUEST_DATA.SendData.Head.jobTitle = jobTitle
    return this
  }

  /**
   * 设置业务系统
   * @param businessSystem
   * @returns {ESBProtocolBuilder}
   */
  setBusinessSystem(businessSystem: string): ESBProtocolBuilder {
    this.request.REQUEST.REQUEST_DATA.SendData.Head.businessSystem =
      businessSystem
    return this
  }

  /**
   * 设置报单人员工号
   * @param proposeUser
   * @returns {ESBProtocolBuilder}
   */
  setProposeUser(proposeUser: string): ESBProtocolBuilder {
    this.request.REQUEST.REQUEST_DATA.SendData.Head.proposeUser = proposeUser
    return this
  }

  /**
   * 设置工单详细描述
   * @param jobDesc
   * @returns {ESBProtocolBuilder}
   */
  setJobDesc(jobDesc: string): ESBProtocolBuilder {
    this.request.REQUEST.REQUEST_DATA.SendData.Head.jobDesc = jobDesc
    return this
  }

  /**
   * 设置时间戳（自动格式化为 yyyy-MM-dd HH:mm:ss）
   * @param date - 如果不提供则使用当前时间
   * @returns {ESBProtocolBuilder}
   */
  setTimestamp(date?: Date): ESBProtocolBuilder {
    const d = date || new Date()
    this.request.REQUEST.REQUEST_DATA.SendData.Head.fbk13 = this._formatDate(d)
    return this
  }

  /**
   * 添加单个附件
   * @param attachmentName - 文件名称
   * @param attachmentDesc - 文件路径
   * @returns {ESBProtocolBuilder}
   */
  addAttachment(
    attachmentName: string,
    attachmentDesc: string
  ): ESBProtocolBuilder {
    if (!this.request.REQUEST.REQUEST_DATA.SendData.Head.attachmentList) {
      this.request.REQUEST.REQUEST_DATA.SendData.Head.attachmentList = []
    }
    this.request.REQUEST.REQUEST_DATA.SendData.Head.attachmentList.push({
      attachmentName,
      attachmentDesc
    })
    return this
  }

  /**
   * 批量添加附件
   * @param attachments
   * @returns {ESBProtocolBuilder}
   */
  addAttachments(attachments: Attachment[]): ESBProtocolBuilder {
    attachments.forEach((att) => {
      this.addAttachment(att.attachmentName, att.attachmentDesc)
    })
    return this
  }

  /**
   * 设置附件列表（覆盖现有）
   * @param attachments
   * @returns {ESBProtocolBuilder}
   */
  setAttachments(attachments: Attachment[]): ESBProtocolBuilder {
    this.request.REQUEST.REQUEST_DATA.SendData.Head.attachmentList = attachments
    return this
  }

  /**
   * 清空附件列表
   * @returns {ESBProtocolBuilder}
   */
  clearAttachments(): ESBProtocolBuilder {
    this.request.REQUEST.REQUEST_DATA.SendData.Head.attachmentList = []
    return this
  }

  /**
   * 设置操作类型
   * @param operation
   * @returns {ESBProtocolBuilder}
   */
  setOperation(operation: string): ESBProtocolBuilder {
    this.request.REQUEST.REQUEST_DATA.Operation = operation
    this.request.REQUEST.REQUEST_DATA.Type = operation
    return this
  }

  /**
   * 设置 SendHead
   * @param sendHead
   * @returns {ESBProtocolBuilder}
   */
  setSendHead(sendHead: Record<string, any>): ESBProtocolBuilder {
    this.request.REQUEST.REQUEST_DATA.SendHead = sendHead
    return this
  }

  /**
   * 设置 SendURL
   * @param sendURL
   * @returns {ESBProtocolBuilder}
   */
  setSendURL(sendURL: Record<string, any>): ESBProtocolBuilder {
    this.request.REQUEST.REQUEST_DATA.SendURL = sendURL
    return this
  }

  /**
   * 设置完整的工单头部信息
   * @param head - 工单头部对象
   * @returns {ESBProtocolBuilder}
   */
  setWorkOrderHead(head: Partial<WorkOrderHead>): ESBProtocolBuilder {
    this.request.REQUEST.REQUEST_DATA.SendData.Head = {
      ...this.request.REQUEST.REQUEST_DATA.SendData.Head,
      ...head
    }
    return this
  }

  /**
   * 构建并返回最终的请求对象
   * @returns {ESBRequest}
   */
  build(): ESBRequest {
    // 如果没有设置 Transaction_ID，自动生成一个
    if (!this.request.REQUEST.ESB_ATTRS.Transaction_ID) {
      this.setTransactionId()
    }

    // 如果没有设置时间戳，自动设置当前时间
    if (!this.request.REQUEST.REQUEST_DATA.SendData.Head.fbk13) {
      this.setTimestamp()
    }

    // 深拷贝返回，避免外部修改影响构造器
    return JSON.parse(JSON.stringify(this.request))
  }

  /**
   * 构建并返回 JSON 字符串
   * @param pretty - 是否格式化输出
   * @returns {string}
   */
  buildJSON(pretty: boolean = false): string {
    return JSON.stringify(this.build(), null, pretty ? 2 : 0)
  }

  /**
   * 重置构造器到初始状态
   * @returns {ESBProtocolBuilder}
   */
  reset(): ESBProtocolBuilder {
    const newBuilder = new ESBProtocolBuilder()
    this.request = newBuilder.request
    return this
  }

  /**
   * 获取当前构造的数据
   * @returns {ESBRequest}
   */
  getData(): ESBRequest {
    return JSON.parse(JSON.stringify(this.request))
  }

  /**
   * 生成 Application ID（日期 + 流水号）
   * 格式：YYYYMMDD + 6位随机数字
   * 示例：202411180123456
   * @private
   * @returns {string}
   */
  private _generateApplicationId(): string {
    const now = new Date()
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}${String(now.getDate()).padStart(2, '0')}`

    // 生成流水号
    const serialNumber = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0')

    return `${dateStr}${serialNumber}`
  }

  /**
   * 生成 UUID v4
   * @private
   * @returns {string}
   */
  private _generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  /**
   * 格式化日期为 yyyy-MM-dd HH:mm:ss
   * @private
   * @param date
   * @returns {string}
   */
  private _formatDate(date: Date): string {
    const pad = (n: number): string => n.toString().padStart(2, '0')

    return (
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate()
      )} ` +
      `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
        date.getSeconds()
      )}`
    )
  }
}

// ============ 导出 ============
export default ESBProtocolBuilder

// 同时支持命名导出
export { ESBProtocolBuilder }

export type { ESBAttrs, Attachment, WorkOrderHead, RequestData, ESBRequest }
