import React from 'react';
import { View, Text } from 'react-native';
import { Anomaly } from '../../../api/services';

interface AnomalyCardProps {
    anomaly: Anomaly;
    categoryName: string;
    categoryIcon: string;
}

export const AnomalyCard: React.FC<AnomalyCardProps> = ({
    anomaly,
    categoryName,
    categoryIcon
}) => {
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' };
            case 'medium': return { bg: '#fffbeb', border: '#fed7aa', text: '#92400e' };
            case 'low': return { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c' };
            default: return { bg: '#fffbeb', border: '#fed7aa', text: '#92400e' };
        }
    };

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case 'high': return '🔴 Yüksek Risk';
            case 'medium': return '🟡 Orta Risk';
            case 'low': return '🟠 Düşük Risk';
            default: return '🟡 Orta Risk';
        }
    };

    const colors = getSeverityColor(anomaly.severity);

    return (
        <View style={{
            backgroundColor: colors.bg,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.border
        }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 24, marginRight: 8 }}>{categoryIcon}</Text>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>{categoryName}</Text>
                </View>
                <View style={{
                    backgroundColor: colors.bg,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 20
                }}>
                    <Text style={{
                        fontSize: 12,
                        fontWeight: '500',
                        color: colors.text
                    }}>
                        {getSeverityBadge(anomaly.severity)}
                    </Text>
                </View>
            </View>

            {/* Delta Info */}
            <View style={{ backgroundColor: 'white', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 14, color: '#6b7280' }}>Değişim:</Text>
                    <Text style={{
                        fontWeight: 'bold',
                        color: anomaly.delta.includes('+') ? '#dc2626' : '#059669'
                    }}>
                        {anomaly.delta}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, color: '#6b7280' }}>Güven:</Text>
                    <Text style={{ fontWeight: '500', color: '#374151' }}>
                        %{anomaly.confidence}
                    </Text>
                </View>
            </View>

            {/* Reason */}
            <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4 }}>Neden:</Text>
                <Text style={{ color: '#6b7280' }}>{anomaly.reason}</Text>
            </View>

            {/* Confidence Level */}
            <View style={{
                backgroundColor: '#dbeafe',
                borderRadius: 8,
                padding: 12,
                borderLeftWidth: 4,
                borderLeftColor: '#3b82f6'
            }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#1e40af', marginBottom: 4 }}>
                    Tespit Güveni: %{anomaly.confidence}
                </Text>
                <Text style={{ color: '#1e40af' }}>
                    Bu anomali {anomaly.confidence}% güvenle tespit edildi
                </Text>
            </View>
        </View>
    );
};
