import { Button, Input, message, Tooltip, Divider, ConfigProvider } from 'antd'
import { useStorage } from '@plasmohq/storage/hook'
import { useState } from 'react'
import { StarryBackground } from '../src/common/components'

import './cosmic.css'
import '../src/antd.css'
import '../src/tailwind.css'

function Popup() {
  const [isAutoSpacingEnabled, setIsAutoSpacingEnabled] = useStorage('auto_spacing_enabled', (v) => v === undefined ? true : v)
  const [excludedDomains, setExcludedDomains] = useStorage<string[]>('excluded_domains', [])

  const [newDomain, setNewDomain] = useState('')
  const [isBlacklistPageOpen, setIsBlacklistPageOpen] = useState(false)

  const [messageApi, contextHolder] = message.useMessage()

  console.log('excludedDomains', excludedDomains);
  console.log('isAutoSpacingEnabled', isAutoSpacingEnabled)
  
  // 添加排除域名
  const addExcludedDomain = () => {
    if (!newDomain) {
      messageApi.error('请输入要排除的域名')
      return
    }

    // 清理域名格式（去除http://、https://、www.前缀）
    let domain = newDomain.trim()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')

    // 检查是否已存在
    if (excludedDomains.includes(domain)) {
      messageApi.warning('该域名已被排除法阵笼罩')
      return
    }

    setExcludedDomains([...excludedDomains, domain])
    setNewDomain('')
    messageApi.success('已将该域名纳入虚空庇护')
  }

  // 删除排除域名
  const removeExcludedDomain = (domain: string) => {
    setExcludedDomains(excludedDomains.filter(d => d !== domain))
    messageApi.success('已从虚空中驱逐该领域')
  }

  // 切换自动加空格功能
  const toggleAutoSpacing = (enabled: boolean) => {
    setIsAutoSpacingEnabled(enabled)

    if (enabled) {
      messageApi.success('「文字间隙公式」已激活')
    } else {
      messageApi.info('「文字间隙公式」已休眠')
    }
  }

  // 手动执行加空格功能
  const manualAddSpacing = async () => {
    try {
      // 获取当前标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab?.id) {
        // 直接向当前页面发送消息
        chrome.tabs.sendMessage(tab.id, { action: 'manualAddSpacing' })
        messageApi.success('银河系标准空白已植入')
      }
    } catch (error) {
      console.error("发送手动添加空格消息失败:", error)
      messageApi.error('空白植入失败，星际能量不足')
    }
  }

  // 打开黑名单页面
  const openBlacklistPage = () => {
    setIsBlacklistPageOpen(true)
  }

  // 返回主页面
  const goBackToMainPage = () => {
    setIsBlacklistPageOpen(false)
  }

  return (
    <ConfigProvider
      wave={{
        disabled: true
      }}
    >
      <div className="w-[400px] h-[500px] overflow-hidden bg-gray-900 text-gray-200 relative">
        {contextHolder}

        {/* 使用星空背景组件 */}
        <StarryBackground starsCount={50} backgroundOpacity={0.3}/>

        <div
          className="flex w-[800px] h-full transition-transform duration-500 ease-in-out"
          style={{ transform: isBlacklistPageOpen ? 'translateX(-400px)' : 'translateX(0)' }}
        >
          {/* 主页面 */}
          <div className="w-[400px] min-w-[400px] h-full flex flex-col items-center">
            {/* 标题 */}
            <div className="py-6 w-full flex flex-col items-center border-b border-gray-700">
              <h1
                className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                Rift 🌌
              </h1>
              <p className="mt-2 text-xs text-gray-400 italic">
                「那些不愿加空格的人，终将被字符的诅咒吞噬。」
              </p>
            </div>

            {/* 主要内容 */}
            <div className="w-full p-6 flex flex-col items-center space-y-4">
              {/* 自动加空格按钮 */}
              <Tooltip title="根据李玄白教授的公式自动为文字创造呼吸空间">
                <Button
                  type="primary"
                  size="large"
                  className="cosmic-button w-[90%] h-14 text-lg rounded-md"
                  onClick={() => toggleAutoSpacing(!isAutoSpacingEnabled)}
                  style={{
                    background: isAutoSpacingEnabled
                      ? 'linear-gradient(90deg, #1677ff 0%, #7546C9 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    color: isAutoSpacingEnabled ? 'white' : '#aaaaaa',
                    border: 'none'
                  }}
                >
                  {isAutoSpacingEnabled
                    ? '0x20 公式运行中...'
                    : '激活文字间隙公式'}
                </Button>
              </Tooltip>

              {/* 手动加空格按钮 */}
              <Tooltip title="对当前页面施展一次字符分离术">
                <Button
                  type="primary"
                  size="large"
                  className="cosmic-button w-[90%] h-14 text-lg rounded-md"
                  onClick={() => manualAddSpacing()}
                  style={{
                    backgroundColor: '#2a82e4',
                    border: 'none'
                  }}
                >
                  手动注入银河系标准空白
                </Button>
              </Tooltip>

              <Divider className="border-gray-700" plain>
                <span className="text-gray-400 text-sm">文明解救程序</span>
              </Divider>

              {/* 黑名单设置按钮 */}
              <Tooltip title="设置哪些域名可以豁免于字符排版法则">
                <Button
                  className="cosmic-button w-[90%] h-14 text-lg rounded-md"
                  style={{
                    backgroundColor: 'rgba(102, 51, 153, 0.7)',
                    color: 'white',
                    border: 'none'
                  }}
                  size="large"
                  onClick={() => openBlacklistPage()}
                >
                  打开虚空排除法阵
                </Button>
              </Tooltip>
            </div>

            {/* 版权信息 */}
            <div className="mt-auto py-3 w-full bg-gray-800 text-center border-t border-gray-700">
              <p className="text-xs text-gray-500">
                Powered by 0x20 × (textOCD / 宇宙熵)
              </p>
            </div>
          </div>

          {/* 黑名单页面 */}
          <div className="w-[400px] min-w-[400px] h-full flex flex-col bg-[#121520]">
            {/* 标题栏 */}
            <div className="py-4 px-5 flex items-center justify-between border-b border-gray-700 bg-[#181B28]">
              <button
                onClick={goBackToMainPage}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <div className="text-lg font-bold flex-1 text-center">
                <span
                  className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-purple-600">虚空庇护区</span>
                <span className="text-gray-100">- 排除法阵控制台</span>
              </div>
              <div className="w-6"></div>
              {/* 为了平衡布局 */}
            </div>

            {/* 内容区域 */}
            <div className="p-5 overflow-y-auto flex-1">
              <div className="mb-5 bg-[#181c26] p-4 rounded-lg border border-[#2a2e3a]">
                <p className="text-sm text-gray-300 mb-3">
                  以下域名将被排除在文字间隙公式之外，其上的文本将继续保持粘连状态。
                </p>
                <div className="flex space-x-2">
                  <Input
                    placeholder="输入域名（支持通配符: *.example.com）"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    onPressEnter={addExcludedDomain}
                    style={{
                      backgroundColor: '#232630',
                      color: '#ddd',
                      border: '1px solid #2d2f3a',
                      borderRadius: '4px'
                    }}
                  />
                  <Button
                    type="primary"
                    onClick={addExcludedDomain}
                    style={{
                      background: 'linear-gradient(90deg, #4776E6 0%, #6250DF 100%)',
                      border: 'none',
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}
                  >
                    添加
                  </Button>
                </div>
                <div className="mt-2 p-2 bg-[#232630] rounded-md text-xs text-gray-400">
                  <p className="mb-1">支持的通配符格式:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><code className="bg-[#1b1e29] px-1 rounded">*.example.com</code> - 匹配所有example.com的子域名
                    </li>
                    <li><code className="bg-[#1b1e29] px-1 rounded">example.*</code> - 匹配所有以example开头的域名</li>
                    <li><code className="bg-[#1b1e29] px-1 rounded">*example*</code> - 匹配所有包含example的域名</li>
                  </ul>
                </div>
              </div>

              <div className="bg-[#181c26] p-4 rounded-lg border border-[#2a2e3a]">
                <h3 className="text-gray-300 mb-3 text-sm font-medium">已排除域名列表</h3>
                {excludedDomains.length > 0 ? (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {excludedDomains?.map((domain) => (
                      <div key={domain}
                           className="flex justify-between items-center p-3 bg-[#232630] rounded-md border border-[#2f3242]">
                        <span className="text-sm text-gray-300 font-mono">{domain}</span>
                        <Button
                          size="small"
                          style={{
                            backgroundColor: 'rgba(220, 38, 38, 0.2)',
                            color: '#ff6b6b',
                            border: '1px solid rgba(220, 38, 38, 0.3)'
                          }}
                          onClick={() => removeExcludedDomain(domain)}
                        >
                          驱逐
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-[#232630] rounded-md text-center border border-[#2f3242]">
                    <p className="text-sm text-gray-400">虚空中尚无被排除的领域</p>
                    <p className="text-xs text-gray-500 mt-1">所有网站都将遵循李玄白教授的公式</p>
                  </div>
                )}
              </div>
            </div>

            {/* 底部信息 */}
            <div className="py-3 w-full bg-gray-800 text-center border-t border-gray-700">
              <p className="text-xs text-gray-500">
                维度坐标：0x20 × (textOCD / 宇宙熵)
              </p>
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  )
}

export default Popup
