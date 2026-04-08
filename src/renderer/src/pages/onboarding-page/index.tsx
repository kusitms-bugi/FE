import CameraIcon from '@assets/common/icons/camera.svg?react'
import { useTranslation } from 'react-i18next'
import CameraPermissionButton from './components/CameraPermissionButton'

const OnboardingPage = () => {
  const { t } = useTranslation('onboarding')

  return (
    <main className="hbp:pt-[75px] hbp:h-[calc(100vh-75px)] flex h-[calc(100vh-60px)] flex-col items-center pt-15">
      <div className="hbp:mx-auto hbp:max-w-screen-lg hbp:px-10 relative w-full overflow-visible">
        <section className="hbp:gap-15 hbp:px-20 flex h-full w-full flex-col items-center justify-center gap-12 px-7">
          <CameraIcon />
          <div className="text-title-4xl-bold text-grey-900">
            {t('카메라 사용 권한')}
          </div>
          <div className="text-headline-2xl-regular text-grey-500 text-center">
            {t('거부기린은 PC 웹캡을 통해 사용자의 자세를 실시간으로 분석해요.\n모든 분석은 사용자 PC 내에서만 이루어지며 영상은 서버로 전송되지 않아요.').split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i === 0 && <br />}
              </span>
            ))}
          </div>
          <CameraPermissionButton />
        </section>
      </div>
    </main>
  )
}

export default OnboardingPage
