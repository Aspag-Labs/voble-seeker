import React from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { Calendar } from 'lucide-react-native';

interface ActivityHeatmapProps {
    gameHistory: { created_at: string }[];
}

export function ActivityHeatmap({ gameHistory }: ActivityHeatmapProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Map "YYYY-MM-DD" -> count
    const activityMap = new Map<string, number>();
    gameHistory.forEach((game) => {
        const date = new Date(game.created_at).toISOString().split('T')[0];
        activityMap.set(date, (activityMap.get(date) || 0) + 1);
    });

    // Last 91 days (13 weeks)
    const today = new Date();
    const daysToShow = 91;
    const calendarDays: { date: string; count: number }[] = [];

    for (let i = daysToShow - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const count = activityMap.get(dateStr) || 0;
        calendarDays.push({ date: dateStr, count });
    }

    const getColor = (count: number) => {
        if (count === 0) return isDark ? '#1e293b' : '#f1f5f9';
        return '#22c55e'; // green-500
    };

    const totalActive = calendarDays.filter((d) => d.count > 0).length;

    return (
        <View className={`rounded-2xl p-4 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <View className="flex-row items-center mb-3">
                <Calendar size={16} color={isDark ? '#64748b' : '#94a3b8'} />
                <Text className={`ml-2 text-xs uppercase font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Activity (Last 90 Days)
                </Text>
                <Text className={`ml-auto text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {totalActive} days active
                </Text>
            </View>
            <View className="flex-row flex-wrap" style={{ gap: 2 }}>
                {calendarDays.map((day) => (
                    <View
                        key={day.date}
                        style={{
                            width: 10,
                            height: 10,
                            borderRadius: 2,
                            backgroundColor: getColor(day.count),
                        }}
                    />
                ))}
            </View>
        </View>
    );
}
