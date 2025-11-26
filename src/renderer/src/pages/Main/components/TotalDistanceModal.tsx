import { Button } from '@ui/Button/Button';
import { ModalPortal } from '@ui/Modal/ModalPortal';
import CharacterSpeedRow, { CHARACTER_SPEED_DATA } from './CharacterSpeedRow';

interface TotalDistanceModalProps {
    onClose: () => void;
}

const TotalDistanceModal = ({ onClose }: TotalDistanceModalProps) => {
    return (
        <ModalPortal>
            <div
                className="fixed inset-0 z-999999 h-full w-full bg-black/40 dark:bg-black/70"
                onClick={onClose}
            >
                <div
                    className="bg-surface-modal border-grey-0 fixed top-[45%] left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-[24px] border p-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col px-4 w-[438px]">
                        <h2 className="text-body-lg-semibold text-grey-900 mb-6 text-center">캐릭터별 속도를 소개해요</h2>
                        <div className="flex flex-col gap-1">
                            <div className='flex text-grey-300 text-caption-xs-regular justify-between'>
                                <div className='w-25'>자세 상태</div>
                                <div className='w-[150px] text-center'>캐릭터</div>
                                <div className='w-[58px] text-right'>시간당 속도</div>
                            </div>
                            <div className='h-px w-full bg-bg-line my-2' />
                            <div className='w-full flex flex-col gap-3 text-caption-xs-meidum text-gray-500'>
                                {CHARACTER_SPEED_DATA.map((character) => (
                                    <CharacterSpeedRow
                                        key={character.level}
                                        level={character.level}
                                        name={character.name}
                                        speed={character.speed}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={onClose}
                        text="닫기"
                        variant="primary"
                        size="md"
                        className="mt-2"
                    />
                </div>
            </div>
        </ModalPortal>
    );
};

export default TotalDistanceModal;

