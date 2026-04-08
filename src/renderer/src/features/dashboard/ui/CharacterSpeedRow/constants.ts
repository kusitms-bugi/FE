import AngelRiniModal from '@assets/modal/angel-rini-modal.svg?react'
import BugiModal from '@assets/modal/bugi-modal.svg?react'
import PmRiniModal from '@assets/modal/pm-rini-modal.svg?react'
import RiniModal from '@assets/modal/rini-modal.svg?react'
import StoneBugiModal from '@assets/modal/stone-bugi-modal.svg?react'
import TireBugiModal from '@assets/modal/tire-bugi-modal.svg?react'
import i18n from '@shared/lib/i18n/i18n'
import type * as React from 'react'

interface CharacterSpeedRowProps {
  level: number
  name: string
  speed: string
}

export const CHARACTER_COMPONENTS: Record<
  number,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  1: TireBugiModal,
  2: StoneBugiModal,
  3: BugiModal,
  4: RiniModal,
  5: PmRiniModal,
  6: AngelRiniModal,
}

export const CHARACTER_NAMES: Record<number, string> = {
  1: i18n.t('타이어 맨 거부기', { ns: 'dashboard' }),
  2: i18n.t('돌덩이 거부기', { ns: 'dashboard' }),
  3: i18n.t('거부기', { ns: 'dashboard' }),
  4: i18n.t('기린', { ns: 'dashboard' }),
  5: i18n.t('씽씽이 기린', { ns: 'dashboard' }),
  6: i18n.t('천사기린', { ns: 'dashboard' }),
}

export const CHARACTER_SPEED_DATA: CharacterSpeedRowProps[] = [
  { level: 1, name: CHARACTER_NAMES[1], speed: '0.1m/h' },
  { level: 2, name: CHARACTER_NAMES[2], speed: '50m/h' },
  { level: 3, name: CHARACTER_NAMES[3], speed: '200m/h' },
  { level: 4, name: CHARACTER_NAMES[4], speed: '500m/h' },
  { level: 5, name: CHARACTER_NAMES[5], speed: '1.5km/h' },
  { level: 6, name: CHARACTER_NAMES[6], speed: ' 3km/h' },
]
