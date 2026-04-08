import { useTranslation } from 'react-i18next'

interface ResendSectionProps {
  onClick: () => void
}

export default function ResendSection({ onClick }: ResendSectionProps) {
  const { t } = useTranslation('auth')
  return (
    <p className="text-caption-sm-regular text-grey-300 mt-8 flex flex-row gap-3">
      {t('이메일을 못받으셨나요?')}
      <span
        onClick={onClick}
        className="cursor-pointer text-yellow-500 underline"
      >
        {t('이메일 다시 보내기')}
      </span>
    </p>
  )
}
