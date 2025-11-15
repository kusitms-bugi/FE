import { Button } from '../../../components/Button/Button';

interface WelcomePanelProps {
  isPoseDetected: boolean;
  onStartMeasurement: () => void;
}

const WelcomePanel = ({
  isPoseDetected,
  onStartMeasurement,
}: WelcomePanelProps) => {
  return (
    <div className="flex w-[422px] min-w-[422px] shrink-0 flex-col pt-12">
      <div className="mb-12">
        <h1 className="text-title-4xl-bold text-grey-900 mb-[20px]">
          바른자세 기준점 등록
        </h1>
        <p className="text-body-xl-medium text-grey-500 leading-relaxed">
          거부기온앤온님의 바른 자세를 등록할 준비가 되셨다면
          <br />
          측정하기 버튼을 눌러주세요.
        </p>
      </div>
      <Button
        text="측정하기"
        className="text-body-xl-medium w-[149px]"
        size="xl"
        disabled={!isPoseDetected}
        onClick={onStartMeasurement}
      />
    </div>
  );
};

export default WelcomePanel;
