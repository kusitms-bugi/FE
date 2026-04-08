import MediumGiraffe from '@assets/widget/medium_giraffe.svg?react'
import MediumTurtle from '@assets/widget/medium_turtle.svg?react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import messages from '../data.json'

/* 실시간 자세 판별 */
type PostureState = 0 | 1 | 2 | 3 | 4 | 5 | 6

interface Message {
  level: number
  mainTitleKey: string
  subTitleKeys: string[]
}

interface MediumWidgetContentProps {
  posture: PostureState
}

/* 미디엄 위젯 레이아웃 */
export function MediumWidgetContent({ posture }: MediumWidgetContentProps) {
  const { t } = useTranslation('widget')
  const [mainTitle, setMainTitle] = useState(t('자세를 측정하고 있어요'))
  const [subTitle, setSubTitle] = useState(t('잠시만 기다려주세요...'))

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const messageData = messages.find((m: Message) => m.level === posture)

    if (messageData) {
      setMainTitle(t(messageData.mainTitleKey))
      const { subTitleKeys } = messageData
      const randomIndex = Math.floor(Math.random() * subTitleKeys.length)
      setSubTitle(t(subTitleKeys[randomIndex]))
    } else {
      // posture가 0이거나 유효하지 않은 경우 기본 메시지 설정
      setMainTitle(t('자세를 측정하고 있어요'))
      setSubTitle(t('잠시만 기다려주세요...'))
    }
  }, [posture, t])
  /* eslint-enable react-hooks/set-state-in-effect */

  const isGiraffe = [1, 2, 3].includes(posture)
  const gradient = isGiraffe
    ? 'linear-gradient(180deg, var(--color-olive-green) 0.18%, var(--color-success) 99.7%)'
    : 'linear-gradient(180deg, var(--color-coral-red) 0%, var(--color-error) 100%)'

  /* 게이지 비율: 등급별 차등 적용 */
  let gaugeWidth: string
  switch (posture) {
    case 1:
    case 6:
      gaugeWidth = '100%'
      break
    case 2:
    case 5:
      gaugeWidth = '75%'
      break
    case 3:
    case 4:
      gaugeWidth = '50%'
      break
    default: // posture 0
      gaugeWidth = '25%'
      break
  }

  return (
    <div className="flex h-full w-full flex-col pb-[20px] transition-colors duration-500 ease-in-out">
      {/* 캐릭터 영역 */}
      <div
        className="mini:h-auto flex aspect-[1/1] h-full max-h-[235px] w-full flex-1 rounded-lg transition-all duration-500 ease-in-out"
        style={{ background: gradient }}
      >
        {isGiraffe ? (
          <MediumGiraffe className="ml-[-10px] h-full object-contain" />
        ) : (
          <MediumTurtle className="h-full object-contain" />
        )}
      </div>

      {/* 상세 정보 영역 */}
      <div className="bg-grey-0 mt-1 flex w-full flex-1 flex-col justify-center px-2">
        {/* 진행 바 */}
        <div className="h-fit w-full rounded-lg">
          <div className="bg-grey-50 h-3 w-full rounded-full">
            <div
              className="flex h-full justify-end rounded-lg bg-green-500 p-[2px] transition-all duration-500 ease-in-out"
              style={{ width: gaugeWidth, background: gradient }}
            >
              <div className="bg-dot h-2 w-2 rounded-full opacity-50" />
            </div>
          </div>
        </div>

        {/* 메시지 */}
        <div className="bg-grey-0 mt-2">
          <div className="text-body-md-semibold text-grey-700">{mainTitle}</div>
          <div className="text-caption-xs-meidum text-grey-400">{subTitle}</div>
        </div>
      </div>
    </div>
  )
}
