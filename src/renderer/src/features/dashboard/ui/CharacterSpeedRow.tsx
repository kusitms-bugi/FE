import AngelRiniModal from '@assets/angel-rini-modal.svg?react';
import BugiModal from '@assets/bugi-modal.svg?react';
import PmRiniModal from '@assets/pm-rini-modal.svg?react';
import RiniModal from '@assets/rini-modal.svg?react';
import StoneBugiModal from '@assets/stone-bugi-modal.svg?react';
import TireBugiModal from '@assets/tire-bugi-modal.svg?react';

interface CharacterSpeedRowProps {
    level: number;
    name: string;
    speed: string;
}

const CHARACTER_COMPONENTS: Record<number, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
    1: TireBugiModal,
    2: StoneBugiModal,
    3: BugiModal,
    4: RiniModal,
    5: PmRiniModal,
    6: AngelRiniModal,
};

const CHARACTER_NAMES: Record<number, string> = {
    1: '타이어 맨 거부기',
    2: '돌덩이 거부기',
    3: '거부기',
    4: '기린',
    5: '씽씽이 기린',
    6: '천사기린',
};

const CharacterSpeedRow = ({ level, name, speed }: CharacterSpeedRowProps) => {
    const CharacterComponent = CHARACTER_COMPONENTS[level];

    return (
        <div className="flex justify-between items-center w-full">
            <div className="flex gap-1 items-center w-25">
                <div className="bg-sementic-brand-primary text-grey-0 rounded-full w-4 h-[18px] flex justify-center items-center text-caption-xs-medium">
                    {level}
                </div>
                <span>{name}</span>
            </div>
            <div className="flex justify-center w-[150px]">
                {CharacterComponent && (
                    <div className="max-[1439px]:scale-[0.8]">
                        <CharacterComponent />
                    </div>
                )}
            </div>
            <div className="w-[43px] text-left">{speed}</div>
        </div>
    );
};

export const CHARACTER_SPEED_DATA: CharacterSpeedRowProps[] = [
    { level: 1, name: CHARACTER_NAMES[1], speed: '0.1m/h' },
    { level: 2, name: CHARACTER_NAMES[2], speed: '50m/h' },
    { level: 3, name: CHARACTER_NAMES[3], speed: '200m/h' },
    { level: 4, name: CHARACTER_NAMES[4], speed: '500m/h' },
    { level: 5, name: CHARACTER_NAMES[5], speed: '1.5km/h' },
    { level: 6, name: CHARACTER_NAMES[6], speed: ' 3km/h' },
];

export default CharacterSpeedRow;

