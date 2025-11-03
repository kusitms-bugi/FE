import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/Button/Button';

const CameraPermissionButton = () => {
  const navigate = useNavigate();

  const requestCameraPermission = async () => {
    try {
      // 카메라 권한 요청
      console.log('[CameraPermission] Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      console.log(
        '[CameraPermission] Camera access granted, stopping tracks...',
      );
      // 권한이 허용되면 스트림을 중지
      stream.getTracks().forEach((track) => {
        track.stop();
        console.log('[CameraPermission] Track stopped:', track.id);
      });

      // 스트림이 완전히 해제될 때까지 약간의 딜레이
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log('[CameraPermission] Navigating to calibration page...');
      navigate('/onboarding/calibration');
    } catch (error) {
      console.error('[CameraPermission] 카메라 권한 요청 실패:', error);
      if (error instanceof Error) {
        console.error('[CameraPermission] Error name:', error.name);
        console.error('[CameraPermission] Error message:', error.message);
      }
    }
  };

  return (
    <Button
      variant="primary"
      size="xl"
      className="w-[440px]"
      text="카메라 권한 허용"
      onClick={requestCameraPermission}
    />
  );
};

export default CameraPermissionButton;
