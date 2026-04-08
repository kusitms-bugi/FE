import i18n from '@shared/lib/i18n/i18n'
import { z } from 'zod'

export const signUpSchema = z
  .object({
    email: z.string().email(i18n.t('유효한 이메일을 입력해주세요.', { ns: 'auth' })),
    password: z
      .string()
      .min(8, i18n.t('비밀번호는 8자 이상이어야 합니다.', { ns: 'auth' }))
      .max(16, i18n.t('비밀번호는 16자 이하여야 합니다.', { ns: 'auth' }))
      .regex(
        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~`!@#$%^&*()_\-+={[}\]|\\:;"'<>,.?/])[A-Za-z\d~`!@#$%^&*()_\-+={[}\]|\\:;"'<>,.?/]+$/,
        i18n.t('영문, 숫자, 특수문자를 조합해주세요.', { ns: 'auth' }),
      ),
    confirmPassword: z.string(),
    name: z
      .string()
      .min(1, i18n.t('이름을 입력해주세요.', { ns: 'auth' }))
      .max(10, i18n.t('최대 글자수를 초과했습니다.', { ns: 'auth' }))
      .refine(val => !/\s/.test(val), {
        message: i18n.t('띄어쓰기 없이 붙여 작성해주세요.', { ns: 'auth' }),
      }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: i18n.t('비밀번호가 일치하지 않습니다.', { ns: 'auth' }),
    path: ['confirmPassword'],
  })

export type SignUpFormData = z.infer<typeof signUpSchema>
