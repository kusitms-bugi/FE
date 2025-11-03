const HighlightsPanel = () => {
  return (
    <div className="border-grey-100 col-span-12 rounded-2xl border bg-white p-5 lg:col-span-6">
      <div className="mb-4 flex items-center gap-3">
        <h3 className="text-headline-xl-bold text-grey-800">하이라이트</h3>
        <div className="text-caption-md-medium text-warning-500 bg-warning-50 rounded-full px-3 py-1">
          주간
        </div>
      </div>
      <div className="bg-grey-50 h-[200px] rounded-xl" />
    </div>
  );
};

export default HighlightsPanel;
