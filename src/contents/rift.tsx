import React, { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { useStorage } from '@plasmohq/storage/hook'
import type { PlasmoCSConfig, PlasmoRender, PlasmoCSUIJSXContainer } from 'plasmo'

import {
  containsChineseAndHalfWidthChars,
  debounce,
  insertSpacesBetweenChineseAndHalfWidthChars,
  isUrlExcluded
} from '@common/utils'

export const config: PlasmoCSConfig = {
  matches: ['https://*/*']
}

export const getRootContainer = () =>
  new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      const rootContainerParent = document.querySelector("body")
      if (rootContainerParent) {
        clearInterval(checkInterval)
        const rootContainer = document.createElement("div")
        rootContainer.style.display = "none"
        rootContainerParent.appendChild(rootContainer)
        resolve(rootContainer)
      }
    }, 137)
  })

const AutoSpacingComponent = () => {
  const [isEnabled = true] = useStorage('auto_spacing_enabled')
  const [whitelist = []] = useStorage<string[]>('whitelist')

  // 记录已处理节点的WeakSet引用
  const processedNodesRef = useRef<WeakSet<Node>>(new WeakSet<Node>())

  // 全局MutationObserver实例引用
  const observerRef = useRef<MutationObserver | null>(null)

  // 处理文本节点
  const processTextNode = (textNode: Text): void => {
    // 如果功能被禁用，不处理
    if (!isEnabled) return

    // 如果节点已处理，跳过
    if (processedNodesRef.current.has(textNode)) {
      return
    }

    const originalText = textNode.nodeValue
    if (!originalText || !containsChineseAndHalfWidthChars(originalText)) {
      // 即使不需要处理，也标记为已处理
      processedNodesRef.current.add(textNode)
      return
    }

    const newText = insertSpacesBetweenChineseAndHalfWidthChars(originalText)
    if (newText !== originalText) {
      textNode.nodeValue = newText
    }

    // 标记为已处理
    processedNodesRef.current.add(textNode)
  }

  // 递归处理DOM树中的所有文本节点
  const processNode = (node: Node): void => {
    if (!isEnabled) return

    // 跳过script, style, textarea, input等元素
    if (
      node.nodeName === 'SCRIPT' ||
      node.nodeName === 'STYLE' ||
      node.nodeName === 'TEXTAREA' ||
      node.nodeName === 'INPUT' ||
      node.nodeName === 'PRE' ||
      node.nodeName === 'CODE' ||
      node.nodeName === 'SVG' ||
      (node as Element).classList?.contains('no-spacing') // 允许使用类名排除
    ) {
      return
    }

    // 处理文本节点
    if (node.nodeType === Node.TEXT_NODE) {
      processTextNode(node as Text)
      return
    }

    // 递归处理所有子节点
    for (const childNode of Array.from(node.childNodes)) {
      processNode(childNode)
    }
  }

  const manualAddSpaces = () => {
    // 即使功能禁用，手动触发时也执行
    // WeakSet没有clear方法，需要创建一个新的WeakSet
    processedNodesRef.current = new WeakSet<Node>()
    processNode(document.body)
  }

  // 使用防抖处理节点
  const debouncedProcessNode = useRef(
    debounce((node: Node) => {
      // 如果功能被禁用，不处理
      if (!isEnabled) return
      processNode(node)
    }, 200)
  ).current

  // 观察DOM变化并处理新增的节点
  const observeDOMChanges = (): void => {
    // 如果已有观察器，先断开连接
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }

    if (!isEnabled) return

    const observer = new MutationObserver((mutations) => {
      if (!isEnabled) return

      let shouldProcess = false

      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldProcess = true
          break
        }
      }

      if (shouldProcess) {
        debouncedProcessNode(document.body)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    })

    // 保存观察器实例便于以后断开连接
    observerRef.current = observer
  }

  const stopAllProcessing = () => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
    // 重置处理节点集合
    processedNodesRef.current = new WeakSet<Node>()
  }

  // 处理页面内容
  const processPageContent = () => {
    const currentUrl = window.location.href
    const isCurrentUrlExcluded = isUrlExcluded(currentUrl, whitelist)

    // 如果功能被禁用或当前URL在白名单中，不执行处理
    if (!isEnabled || isCurrentUrlExcluded) {
      stopAllProcessing()
      return
    }

    // 首先处理当前页面上的所有文本
    processNode(document.body)

    // 然后监听DOM变化
    observeDOMChanges()
  }

  // 监听来自popup的手动添加空格的消息
  useEffect(() => {
    const handleMessage = (message, sender, sendResponse) => {
      if (message.action === 'manualAddSpacing') {
        manualAddSpaces()
        sendResponse({ success: true })
        return true
      }
    }

    if (chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener(handleMessage)
    }

    return () => {
      if (chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.removeListener(handleMessage)
      }
    }
  }, [])

  // 在页面切换时重新处理（SPA应用）
  useEffect(() => {
    const handlePageChange = () => {
      // 再次检查功能是否启用且当前URL未被排除
      const currentUrl = window.location.href
      const isCurrentUrlExcluded = isUrlExcluded(currentUrl, whitelist)

      if (isEnabled && !isCurrentUrlExcluded) {
        setTimeout(() => processNode(document.body), 300)
      }
    }

    window.addEventListener('popstate', handlePageChange)

    return () => {
      window.removeEventListener('popstate', handlePageChange)
    }
  }, [isEnabled, whitelist])

  // 当配置更改或组件挂载时，处理页面内容
  useEffect(() => {
    const timer = setTimeout(() => {
      processPageContent()
    }, 300)

    return () => {
      clearTimeout(timer)
      stopAllProcessing()
    }
  }, [isEnabled, whitelist])

  return null
}

export const render: PlasmoRender<PlasmoCSUIJSXContainer> = async ({
                                                                     createRootContainer
                                                                   }) => {
  const rootContainer = await createRootContainer()
  const root = createRoot(rootContainer)
  root.render(<AutoSpacingComponent/>)
}

export default AutoSpacingComponent
