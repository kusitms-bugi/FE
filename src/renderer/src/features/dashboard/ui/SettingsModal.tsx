import { Button } from '@shared/ui/button';
import { ModalPortal } from '@shared/ui/modal';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal = ({ onClose }: SettingsModalProps) => {
  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-999999 flex h-full w-full items-center justify-center bg-black/40 dark:bg-black/70"
        onClick={onClose}
      >
        <div
          className="bg-surface-modal border-grey-0 flex w-[420px] flex-col gap-4 rounded-[24px] border p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-2 px-2">
            <h2 className="text-body-lg-semibold text-grey-900 text-center">
              설정
            </h2>
            <p className="text-body-md-regular text-grey-500 text-center">
              설정 기능은 준비 중입니다.
            </p>
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

export default SettingsModal;

