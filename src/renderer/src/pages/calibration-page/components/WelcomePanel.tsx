import { Button } from '@shared/ui/button'
import { useTranslation } from 'react-i18next'

interface WelcomePanelProps {
  isPoseDetected: boolean
  onStartMeasurement: () => void
}

const WelcomePanel = ({
  isPoseDetected,
  onStartMeasurement,
}: WelcomePanelProps) => {
  const { t } = useTranslation('calibration')
  // localStorage에서 사용자 이름 가져오기
  const username = localStorage.getItem('userName') || '사용자'

  return (
    <div className="flex w-[422px] min-w-[422px] shrink-0 flex-col pt-12">
      <div className="mb-12">
        <h1 className="text-title-4xl-bold text-grey-900 mb-[20px]">
          {t('바른자세 기준점 등록')}
        </h1>
        <p className="text-body-xl-medium text-grey-500 leading-relaxed">
          {t('{{username}}님의 바른 자세를 등록할 준비가 되셨다면\n측정하기 버튼을 눌러주세요.', { username }).split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i === 0 && <br />}
            </span>
          ))}
        </p>
      </div>
      <Button
        text={t('측정하기')}
        className="text-body-xl-medium w-[149px]"
        size="xl"
        disabled={!isPoseDetected}
        onClick={onStartMeasurement}
      />
    </div>
  )
}

export default WelcomePanel
