import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface QuickActionsProps {
    onWhatIf: () => void;
    onBillDetail: () => void;
    onAnomalies: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
    onWhatIf,
    onBillDetail,
    onAnomalies
}) => {
    const actions = [
        {
            id: 'whatif',
            title: 'What-If Simülasyonu',
            description: 'Alternatif planları test et',
            icon: '🔮',
            color: '#8b5cf6',
            onPress: onWhatIf
        },
        {
            id: 'billdetail',
            title: 'Fatura Detayları',
            description: 'Kalem kalem incele',
            icon: '📋',
            color: '#3b82f6',
            onPress: onBillDetail
        },
        {
            id: 'anomalies',
            title: 'Anomali Analizi',
            description: 'Şüpheli kalemleri tespit et',
            icon: '⚠️',
            color: '#f59e0b',
            onPress: onAnomalies
        }
    ];

    return (
        <View style={{ backgroundColor: 'white', borderRadius: 12, margin: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>Hızlı İşlemler</Text>

            <View style={{ gap: 12 }}>
                {actions.map((action) => (
                    <TouchableOpacity
                        key={action.id}
                        style={{ backgroundColor: action.color, borderRadius: 8, padding: 16, flexDirection: 'row', alignItems: 'center' }}
                        onPress={action.onPress}
                    >
                        <Text style={{ fontSize: 24, marginRight: 12 }}>{action.icon}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: 'white', fontWeight: '600', fontSize: 18 }}>
                                {action.title}
                            </Text>
                            <Text style={{ color: 'white', fontSize: 14, opacity: 0.9 }}>
                                {action.description}
                            </Text>
                        </View>
                        <Text style={{ color: 'white', fontSize: 18 }}>→</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};
