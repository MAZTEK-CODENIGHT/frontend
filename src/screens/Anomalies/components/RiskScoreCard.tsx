import React from 'react';
import { View, Text } from 'react-native';

interface RiskScoreCardProps {
    riskScore: number;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ riskScore }) => {
    const getRiskLevel = (score: number) => {
        if (score >= 70) return { level: 'Yüksek', color: '#ef4444', textColor: '#fef2f2' };
        if (score >= 40) return { level: 'Orta', color: '#f59e0b', textColor: '#fffbeb' };
        return { level: 'Düşük', color: '#10b981', textColor: '#ecfdf5' };
    };

    const getRiskDescription = (score: number) => {
        if (score >= 70) return 'Faturada ciddi anomaliler tespit edildi. Acil aksiyon gerekli.';
        if (score >= 40) return 'Faturada orta seviyede anomaliler var. Dikkatli takip önerilir.';
        return 'Fatura genel olarak normal görünüyor.';
    };

    const getRiskIcon = (score: number) => {
        if (score >= 70) return '🚨';
        if (score >= 40) return '⚠️';
        return '✅';
    };

    const riskInfo = getRiskLevel(riskScore);
    const riskPercentage = (riskScore / 100) * 100;

    return (
        <View style={{
            backgroundColor: 'white',
            borderRadius: 12,
            margin: 16,
            padding: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3
        }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>Risk Analizi</Text>

            {/* Risk Score Display */}
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <View style={{
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    backgroundColor: riskInfo.color,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12
                }}>
                    <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white' }}>{riskScore}</Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151' }}>Risk Skoru</Text>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>100 üzerinden</Text>
            </View>

            {/* Risk Level */}
            <View style={{
                backgroundColor: riskInfo.color,
                borderRadius: 8,
                padding: 16,
                marginBottom: 16
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 24, marginRight: 8 }}>{getRiskIcon(riskScore)}</Text>
                    <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: riskInfo.textColor
                    }}>
                        {riskInfo.level} Risk
                    </Text>
                </View>
            </View>

            {/* Risk Description */}
            <View style={{ backgroundColor: '#f9fafb', borderRadius: 8, padding: 16 }}>
                <Text style={{ color: '#374151', textAlign: 'center' }}>
                    {getRiskDescription(riskScore)}
                </Text>
            </View>

            {/* Risk Scale */}
            <View style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Risk Skalası:</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ flex: 1, height: 8, backgroundColor: '#d1fae5', borderRadius: 4, overflow: 'hidden' }}>
                        <View style={{ height: '100%', backgroundColor: '#10b981', borderRadius: 4, width: '30%' }} />
                    </View>
                    <View style={{ flex: 1, height: 8, backgroundColor: '#fef3c7', borderRadius: 4, overflow: 'hidden' }}>
                        <View style={{ height: '100%', backgroundColor: '#f59e0b', borderRadius: 4, width: '50%' }} />
                    </View>
                    <View style={{ flex: 1, height: 8, backgroundColor: '#fecaca', borderRadius: 4, overflow: 'hidden' }}>
                        <View style={{ height: '100%', backgroundColor: '#ef4444', borderRadius: 4, width: '20%' }} />
                    </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                    <Text style={{ fontSize: 12, color: '#6b7280' }}>0-30</Text>
                    <Text style={{ fontSize: 12, color: '#6b7280' }}>31-70</Text>
                    <Text style={{ fontSize: 12, color: '#6b7280' }}>71-100</Text>
                </View>
            </View>

            {/* Current Risk Position */}
            <View style={{ marginTop: 16, alignItems: 'center' }}>
                <View style={{
                    width: '100%',
                    height: 8,
                    backgroundColor: '#e5e7eb',
                    borderRadius: 4,
                    position: 'relative'
                }}>
                    <View style={{
                        position: 'absolute',
                        left: `${riskPercentage}%`,
                        top: -4,
                        width: 16,
                        height: 16,
                        backgroundColor: riskInfo.color,
                        borderRadius: 8,
                        transform: [{ translateX: -8 }]
                    }} />
                </View>
                <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
                    Mevcut pozisyon: {riskScore}/100
                </Text>
            </View>
        </View>
    );
};
