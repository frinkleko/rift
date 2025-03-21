import match from "@remusao/url-match-patterns"

// 识别文本节点中的中文和半形英文/数字/符号模式，并在它们之间插入空格
export function insertSpacesBetweenChineseAndHalfWidthChars(
  text: string
): string {
  // 定义半形字符（不包括中文标点）
  const halfWidthPattern =
    "[a-zA-Z0-9`~!@#$%^&*()_\\-+=<>?:\"{}|,.\\/;'\\\\[\\]·]"

  // 匹配规则：
  // 1. 中文后面接英文/数字/半形符号
  // 2. 英文/数字/半形符号后面接中文
  return text
    .replace(
      new RegExp(`([\\u4e00-\\u9fa5])(${halfWidthPattern})`, "g"),
      "$1 $2"
    )
    .replace(
      new RegExp(`(${halfWidthPattern})([\\u4e00-\\u9fa5])`, "g"),
      "$1 $2"
    )
}

// 检查文本是否同时包含中文和半形字符
export function containsChineseAndHalfWidthChars(text: string): boolean {
  const hasChinese = /[\u4e00-\u9fa5]/.test(text)
  const hasHalfWidth = /[a-zA-Z0-9`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·]/.test(
    text
  )
  return hasChinese && hasHalfWidth
}

// 检查URL是否在排除列表中，支持域名和路径级别的通配符匹配
export function isUrlExcluded(
  currentUrl: string,
  excludedPatterns: string[]
): boolean {
  // 遍历排除列表
  for (const pattern of excludedPatterns) {
    try {
      // 直接使用match函数检查URL是否匹配
      if (match(pattern, currentUrl)) {
        return true
      }
    } catch (e) {
      // 如果模式编译失败，跳过此模式
      continue
    }
  }

  return false
}

// 节点处理防抖
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null

  return (...args: Parameters<T>) => {
    if (timeout !== null) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
      timeout = null
    }, wait) as unknown as number
  }
}
