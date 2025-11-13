import { ToggleSwitch } from '../../../components/ToggleSwitch/ToggleSwitch';

const HighlightsPanel = () => {
  return (
    <div className="border-grey-100 col-span-12 rounded-2xl border bg-white p-5 lg:col-span-6">
      <div className="mb-4 flex items-center gap-3">
        <h3 className="text-headline-xl-bold text-grey-800">하이라이트</h3>
        <ToggleSwitch
          uncheckedLabel="주간"
          checkedLabel="월간"
          checked={false}
          onChange={() => {}}
        />
      </div>
      <div className="bg-grey-50 h-[200px] rounded-xl" />
    </div>
  );
};

export default HighlightsPanel;
