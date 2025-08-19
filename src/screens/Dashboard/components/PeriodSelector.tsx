import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface PeriodSelectorProps {
    selectedPeriod: string;
    onPeriodChange: (period: string) => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
    selectedPeriod,
    onPeriodChange
}) => {
    const generatePeriods = () => {
        const periods = [];
        const currentDate = new Date();

        for (let i = 0; i < 12; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

            periods.push({
                period,
                displayName: monthName,
                isCurrent: i === 0
            });
        }

        return periods;
    };

    const periods = generatePeriods();

    return (
        <View style={{ backgroundColor: 'white', borderRadius: 12, margin: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 }}>Dönem Seçimi</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row' }}>
                    {periods.map((period) => (
                        <TouchableOpacity
                            key={period.period}
                            style={{
                                borderRadius: 8,
                                padding: 12,
                                margin: 4,
                                minWidth: 100,
                                backgroundColor: selectedPeriod === period.period ? '#2563eb' : '#f3f4f6',
                                borderWidth: selectedPeriod === period.period ? 2 : 1,
                                borderColor: selectedPeriod === period.period ? '#1d4ed8' : '#d1d5db'
                            }}
                            onPress={() => onPeriodChange(period.period)}
                        >
                            <Text
                                style={{
                                    textAlign: 'center',
                                    fontWeight: '500',
                                    color: selectedPeriod === period.period ? 'white' : '#374151'
                                }}
                            >
                                {period.displayName}
                            </Text>
                            {period.isCurrent && (
                                <Text
                                    style={{
                                        textAlign: 'center',
                                        fontSize: 12,
                                        marginTop: 4,
                                        color: selectedPeriod === period.period ? '#bfdbfe' : '#2563eb'
                                    }}
                                >
                                    Güncel
                                </Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};
