/**
 * ESB 协议构造器
 * 用于构建符合 ESB 规范的请求数据格式
 * Node.js 环境
 */
interface ESBAttrs {
    App_ID: string;
    Target_ID: string;
    Application_ID: string;
    Transaction_ID: string;
}
interface Attachment {
    attachmentName: string;
    attachmentDesc: string;
}
interface WorkOrderHead {
    jobTitle: string;
    businessSystem: string;
    proposeUser: string;
    jobDesc: string;
    fbk13: string;
    eventId: string;
    attachmentList: Attachment[];
}
interface RequestData {
    SendData: {
        Head: WorkOrderHead;
    };
    SendHead: Record<string, any>;
    SendURL: Record<string, any>;
    Operation: string;
    Type: string;
}
interface ESBRequest {
    REQUEST: {
        ESB_ATTRS: ESBAttrs;
        REQUEST_DATA: RequestData;
    };
}
declare class ESBProtocolBuilder {
    private request;
    constructor();
    /**
     * 设置 ESB 属性
     * @param attrs - ESB 属性对象
     * @returns {ESBProtocolBuilder}
     */
    setESBAttrs(attrs: Partial<ESBAttrs>): ESBProtocolBuilder;
    /**
     * 设置 App ID
     * @param appId
     * @returns {ESBProtocolBuilder}
     */
    setAppId(appId: string): ESBProtocolBuilder;
    /**
     * 设置 Event ID
     * @param eventId
     * @returns {ESBProtocolBuilder}
     */
    setEventId(eventId: string): ESBProtocolBuilder;
    /**
     * 设置 Target ID
     * @param targetId
     * @returns {ESBProtocolBuilder}
     */
    setTargetId(targetId: string): ESBProtocolBuilder;
    /**
     * 设置 Application ID
     * @param applicationId
     * @returns {ESBProtocolBuilder}
     */
    setApplicationId(applicationId: string): ESBProtocolBuilder;
    /**
     * 生成新的 Application ID
     * @returns {ESBProtocolBuilder}
     */
    generateApplicationId(): ESBProtocolBuilder;
    /**
     * 设置或生成 Transaction ID
     * @param transactionId - 如果不提供则自动生成
     * @returns {ESBProtocolBuilder}
     */
    setTransactionId(transactionId?: string): ESBProtocolBuilder;
    /**
     * 设置工单标题
     * @param jobTitle
     * @returns {ESBProtocolBuilder}
     */
    setJobTitle(jobTitle: string): ESBProtocolBuilder;
    /**
     * 设置业务系统
     * @param businessSystem
     * @returns {ESBProtocolBuilder}
     */
    setBusinessSystem(businessSystem: string): ESBProtocolBuilder;
    /**
     * 设置报单人员工号
     * @param proposeUser
     * @returns {ESBProtocolBuilder}
     */
    setProposeUser(proposeUser: string): ESBProtocolBuilder;
    /**
     * 设置工单详细描述
     * @param jobDesc
     * @returns {ESBProtocolBuilder}
     */
    setJobDesc(jobDesc: string): ESBProtocolBuilder;
    /**
     * 设置时间戳（自动格式化为 yyyy-MM-dd HH:mm:ss）
     * @param date - 如果不提供则使用当前时间
     * @returns {ESBProtocolBuilder}
     */
    setTimestamp(date?: Date): ESBProtocolBuilder;
    /**
     * 添加单个附件
     * @param attachmentName - 文件名称
     * @param attachmentDesc - 文件路径
     * @returns {ESBProtocolBuilder}
     */
    addAttachment(attachmentName: string, attachmentDesc: string): ESBProtocolBuilder;
    /**
     * 批量添加附件
     * @param attachments
     * @returns {ESBProtocolBuilder}
     */
    addAttachments(attachments: Attachment[]): ESBProtocolBuilder;
    /**
     * 设置附件列表（覆盖现有）
     * @param attachments
     * @returns {ESBProtocolBuilder}
     */
    setAttachments(attachments: Attachment[]): ESBProtocolBuilder;
    /**
     * 清空附件列表
     * @returns {ESBProtocolBuilder}
     */
    clearAttachments(): ESBProtocolBuilder;
    /**
     * 设置操作类型
     * @param operation
     * @returns {ESBProtocolBuilder}
     */
    setOperation(operation: string): ESBProtocolBuilder;
    /**
     * 设置 SendHead
     * @param sendHead
     * @returns {ESBProtocolBuilder}
     */
    setSendHead(sendHead: Record<string, any>): ESBProtocolBuilder;
    /**
     * 设置 SendURL
     * @param sendURL
     * @returns {ESBProtocolBuilder}
     */
    setSendURL(sendURL: Record<string, any>): ESBProtocolBuilder;
    /**
     * 设置完整的工单头部信息
     * @param head - 工单头部对象
     * @returns {ESBProtocolBuilder}
     */
    setWorkOrderHead(head: Partial<WorkOrderHead>): ESBProtocolBuilder;
    /**
     * 构建并返回最终的请求对象
     * @returns {ESBRequest}
     */
    build(): ESBRequest;
    /**
     * 构建并返回 JSON 字符串
     * @param pretty - 是否格式化输出
     * @returns {string}
     */
    buildJSON(pretty?: boolean): string;
    /**
     * 重置构造器到初始状态
     * @returns {ESBProtocolBuilder}
     */
    reset(): ESBProtocolBuilder;
    /**
     * 获取当前构造的数据
     * @returns {ESBRequest}
     */
    getData(): ESBRequest;
    /**
     * 生成 Application ID（日期 + 流水号）
     * 格式：YYYYMMDD + 6位随机数字
     * 示例：202411180123456
     * @private
     * @returns {string}
     */
    private _generateApplicationId;
    /**
     * 生成 UUID v4
     * @private
     * @returns {string}
     */
    private _generateUUID;
    /**
     * 格式化日期为 yyyy-MM-dd HH:mm:ss
     * @private
     * @param date
     * @returns {string}
     */
    private _formatDate;
}
export default ESBProtocolBuilder;
export { ESBProtocolBuilder };
export type { ESBAttrs, Attachment, WorkOrderHead, RequestData, ESBRequest };
//# sourceMappingURL=ESBProtocolBuilder.d.ts.map