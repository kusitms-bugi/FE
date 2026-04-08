import { useTranslation } from 'react-i18next'

export default function ResendEmailHerosection() {
  const { t } = useTranslation('auth')
  return (
    <div className="flex flex-col items-center gap-8">
      <p className="text-title-4xl-bold text-grey-700">
        {t('인증 링크를 메일로 전송했습니다')}
      </p>
      <p className="text-headline-2xl-regular text-grey-800 text-center">
        {t('이메일로 전송 받은 인증 링크를 확인해주세요.')}
        <br />
        {t('링크는 발송 시점으로부터 24시간 동안 유효합니다.')}
      </p>
    </div>
  )
}
