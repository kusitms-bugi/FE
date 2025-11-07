import { useEffect, useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

const ExitPanel = () => {
    // 다크모드 상태 (간단한 방법)
    const [isDark, setIsDark] = useState(() =>
        document.documentElement.classList.contains('dark')
    );

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });
        return () => observer.disconnect();
    }, []);

    // CSS 변수에서 색상 가져오기
    const getColor = (cssVar: string, fallback: string) => {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(cssVar)
            .trim() || fallback;
    };

    // 예시 데이터 - 실제 데이터로 교체 필요
    const totalTime = 169; // 총 169분 (2시간 49분)
    const correctPostureTime = 54; // 바른 자세 시간 (분)
    const correctPosturePercentage = Math.round((correctPostureTime / totalTime) * 100); // 32%
    const score = 80; // 바른 자세 점수

    // CSS 변수에서 색상 가져오기 (다크모드 변경 시 재계산)
    const colors = useMemo(() => ({
        time: getColor('--color-point-green', '#22c55e'),
        background: getColor('--color-grey-25', '#e5e7eb'),
        score: getColor('--color-yellow-500', '#fbbf24'),
    }), [isDark]);

    // 안쪽 링 배경 데이터 (회색) - 전체를 회색으로 채움
    const innerBackgroundData = useMemo(
        () => [{ name: '배경', value: 100, color: colors.background }],
        [colors.background]
    );

    // 안쪽 링 프로그레스 데이터 (노란색) - 바른 자세 점수만큼 노란색
    const ScoreProgressData = useMemo(
        () => [{ name: '바른 자세 점수', value: score, color: colors.score }],
        [score, colors.score]
    );

    // 바깥쪽 링 배경 데이터 (회색) - 전체를 회색으로 채움
    const BackgroundData = useMemo(
        () => [{ name: '배경', value: 100, color: colors.background }],
        [colors.background]
    );

    // 바깥쪽 링 프로그레스 데이터 (녹색) - 바른 자세 비율만큼 녹색
    const TimeProgressData = useMemo(
        () => [{ name: '바른 자세 시간', value: correctPosturePercentage, color: colors.time }],
        [correctPosturePercentage, colors.time]
    );

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}시간 ${mins}분`;
    };

    return (
        <div className="">
            <div className="bg-white dark:bg-grey-100 rounded-xl p-6">
                <div className="mb-12">
                    <h2 className="text-caption-sm-medium text-grey-400">오늘의 리포트</h2>
                    <p className="text-headline-3xl-semibold text-grey-700">뽀각거부기 2cm 성장</p>
                </div>

                {/* 도넛 차트 */}
                <div className="relative flex justify-center mb-12">
                    <ResponsiveContainer width="100%" height={212.5}>
                        <PieChart>
                            {/* 1. 바깥쪽 링 배경 (회색, 둥글지 않음) */}
                            <Pie
                                data={BackgroundData}
                                cx="50%"
                                cy="50%"
                                innerRadius={92}
                                outerRadius={106.25}
                                startAngle={450}
                                endAngle={90}
                                dataKey="value"
                                stroke="none"
                                paddingAngle={0}
                                cornerRadius={0}
                                isAnimationActive={false}
                            >
                                <Cell fill={BackgroundData[0].color} />
                            </Pie>

                            {/* 2. 바깥쪽 링 프로그레스 (녹색, 둥글게) */}
                            <Pie
                                data={ScoreProgressData}
                                cx="50%"
                                cy="50%"
                                innerRadius={92}
                                outerRadius={106.25}
                                startAngle={450}
                                endAngle={450 - (correctPosturePercentage / 100) * 360}
                                dataKey="value"
                                stroke="none"
                                paddingAngle={0}
                                cornerRadius={10}
                            >
                                <Cell fill={ScoreProgressData[0].color} />
                            </Pie>

                            {/* 3. 안쪽 링 배경 (회색, 둥글지 않음) */}
                            <Pie
                                data={innerBackgroundData}
                                cx="50%"
                                cy="50%"
                                innerRadius={77.75}
                                outerRadius={92}
                                startAngle={450}
                                endAngle={90}
                                dataKey="value"
                                stroke="none"
                                paddingAngle={0}
                                cornerRadius={0}
                                isAnimationActive={false}
                            >
                                <Cell fill={innerBackgroundData[0].color} />
                            </Pie>

                            {/* 4. 안쪽 링 프로그레스 (노란색, 둥글게) */}
                            <Pie
                                data={TimeProgressData}
                                cx="50%"
                                cy="50%"
                                innerRadius={77.75}
                                outerRadius={92}
                                startAngle={450}
                                endAngle={450 - (score / 100) * 360}
                                dataKey="value"
                                stroke="none"
                                paddingAngle={0}
                                cornerRadius={10}
                            >
                                <Cell fill={TimeProgressData[0].color} />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    {/* 중앙 텍스트 */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-caption-sm-regular text-grey-500">사용시간</p>
                        <p className="text-headline-2xl-semibold text-grey-600">{formatTime(totalTime)}</p>
                    </div>
                </div>

                {/* 하단 지표 */}
                <div className="flex justify-between">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1 mb-2">
                            <div
                                className="w-2 h-4 rounded-full"
                                style={{ backgroundColor: colors.time }}
                            />
                            <span className="text-body-md-medium text-grey-400">바른 자세 시간</span>
                        </div>
                        <p className="ml-3 text-headline-2xl-semibold text-grey-600">{correctPosturePercentage}%</p>
                    </div>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-1 mb-2">
                            <div
                                className="w-2 h-4 rounded-full"
                                style={{ backgroundColor: colors.score }}
                            />
                            <span className="text-body-md-medium text-grey-400">바른 자세 점수</span>
                        </div>
                        <p className="ml-3 text-headline-2xl-semibold text-grey-600">{score}점</p>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ExitPanel;

