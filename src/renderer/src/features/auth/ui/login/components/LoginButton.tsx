import { Button } from '@shared/ui/button'
import { useTranslation } from 'react-i18next'

interface LoginButtonProps {
  text?: string
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export default function LoginButton({
  text: _text = '',
  type = 'button',
  onClick,
  disabled = true,
  className = '',
}: LoginButtonProps) {
  const { t } = useTranslation('auth')
  return (
    <Button
      text={t('로그인')}
      type={type}
      onClick={onClick}
      disabled={disabled}
      variant="primary"
      size="xl"
      className={`hbp:mt-7 mt-5 w-full ${className} hbp:h-[74px] text-headline-2xl-medium`}
    >
      {t('로그인')}
    </Button>
  )
}
