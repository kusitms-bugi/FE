/* 위젯 창에 표시될 페이지 */

export function WidgetPage() {
  return (
    <div className="h-screen w-full bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="h-full rounded-lg bg-white p-6 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold">자세 위젯</h1>

        <div className="space-y-4">
          <div className="border-b pb-2">
            <h2 className="text-lg font-semibold">현재 상태</h2>
            <p className="text-gray-600">자세 모니터링 중...</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded bg-blue-50 p-4">
              <div className="text-sm text-gray-600">자세 점수</div>
              <div className="text-2xl font-bold text-blue-600">85</div>
            </div>

            <div className="rounded bg-purple-50 p-4">
              <div className="text-sm text-gray-600">사용 시간</div>
              <div className="text-2xl font-bold text-purple-600">2h</div>
            </div>
          </div>

          <div className="rounded bg-yellow-50 p-4">
            <div className="text-sm font-semibold text-yellow-800">알림</div>
            <div className="text-sm text-yellow-700">
              30분마다 스트레칭을 권장합니다
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
