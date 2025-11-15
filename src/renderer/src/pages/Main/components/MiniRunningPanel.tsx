import { useCameraStore } from '../../../store/useCameraStore';
import ExitPanel from './ExitPanel';
import RunningPanel from './RunningPanel';

const MiniRunningPanel = () => {
  const { cameraState } = useCameraStore();
  const isExit = cameraState === 'exit';

  return isExit ? <ExitPanel /> : <RunningPanel />;
};

export default MiniRunningPanel;
