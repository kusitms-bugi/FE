interface Props {
  statusText: '정상' | '거북목' | '측정중';
}

const MiniRunningPanel = ({ statusText }: Props) => {
  const badgeClass =
    statusText === '거북목'
      ? 'bg-error-50 text-error-600'
      : statusText === '정상'
        ? 'bg-success-50 text-success-600'
        : 'bg-grey-50 text-grey-600';

  return (
    <div className="border-grey-100 rounded-2xl border bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-body-lg-medium text-grey-600">업급업급 가는중..</p>
        <span
          className={`${badgeClass} text-caption-md-medium rounded-full px-3 py-1`}
        >
          {statusText}
        </span>
      </div>
      <div className="bg-grey-100 h-[360px] w-full rounded-xl" />
    </div>
  );
};

export default MiniRunningPanel;
