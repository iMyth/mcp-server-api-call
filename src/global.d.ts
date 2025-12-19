/**
 * 附件信息
 */
interface Attachment {
  /** 文件名 */
  filename?: string;
  /** 文件URL */
  url?: string;
  /** 文件大小 */
  size?: number;
}

/**
 * 用户反馈输入数据
 */
interface FeedbackInput {
  /** 用户姓名 (1-100字符) */
  name?: string;
  /** 用户邮箱 */
  email?: string;
  /** 员工编号 (必填) */
  empNo: string;
  /** 系统名称 (必填) */
  system: string;
  /** 事件ID */
  eventId?: string;
  /** 回放ID */
  replayId?: string;
  /** 反馈标题 (必填, 1-100字符) */
  title: string;
  /** 反馈内容 (必填, 1-5000字符) */
  content: string;
  /** 附件列表 */
  attachments?: Attachment[];
}