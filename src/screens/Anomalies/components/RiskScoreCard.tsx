import React from 'react';
import { View, Text } from 'react-native';

interface RiskScoreCardProps {
    riskScore: number;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ riskScore }) => {
    const getRiskLevel = (score: number) => {
        if (score >= 8) return { level: 'Yüksek', color: 'bg-red-500', textColor: 'text-red-100' };
        if (score >= 5) return { level: 'Orta', color: 'bg-yellow-500', textColor: 'text-yellow-100' };
        return { level: 'Düşük', color: 'bg-green-500', textColor: 'text-green-100' };
    };

    const getRiskDescription = (score: number) => {
        if (score >= 8) return 'Faturada ciddi anomaliler tespit edildi. Acil aksiyon gerekli.';
        if (score >= 5) return 'Faturada orta seviyede anomaliler var. Dikkatli takip önerilir.';
        return 'Fatura genel olarak normal görünüyor.';
    };

    const getRiskIcon = (score: number) => {
        if (score >= 8) return '🚨';
        if (score >= 5) return '⚠️';
        return '✅';
    };

    const riskInfo = getRiskLevel(riskScore);

    return (
        <View className="bg-white rounded-xl m-4 p-6 shadow-lg">
            <Text className="text-xl font-bold text-gray-900 mb-4">Risk Analizi</Text>

            {/* Risk Score Display */}
            <View className="items-center mb-6">
                <View className={`w-24 h-24 rounded-full ${riskInfo.color} items-center justify-center mb-3`}>
                    <Text className="text-3xl font-bold text-white">{riskScore}</Text>
                </View>
                <Text className="text-lg font-semibold text-gray-700">Risk Skoru</Text>
                <Text className="text-sm text-gray-500">10 üzerinden</Text>
            </View>

            {/* Risk Level */}
            <View className={`${riskInfo.color} rounded-lg p-4 mb-4`}>
                <View className="flex-row items-center justify-center">
                    <Text className="text-2xl mr-2">{getRiskIcon(riskScore)}</Text>
                    <Text className={`text-lg font-bold ${riskInfo.textColor}`}>
                        {riskInfo.level} Risk
                    </Text>
                </View>
            </View>

            {/* Risk Description */}
            <View className="bg-gray-50 rounded-lg p-4">
                <Text className="text-gray-700 text-center">
                    {getRiskDescription(riskScore)}
                </Text>
            </View>

            {/* Risk Scale */}
            <View className="mt-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Risk Skalası:</Text>
                <View className="flex-row items-center space-x-2">
                    <View className="flex-1 h-2 bg-green-200 rounded-full overflow-hidden">
                        <View className="h-full bg-green-500 rounded-full" style={{ width: '30%' }} />
                    </View>
                    <View className="flex-1 h-2 bg-yellow-200 rounded-full overflow-hidden">
                        <View className="h-full bg-yellow-500 rounded-full" style={{ width: '50%' }} />
                    </View>
                    <View className="flex-1 h-2 bg-red-200 rounded-full overflow-hidden">
                        <View className="h-full bg-red-500 rounded-full" style={{ width: '20%' }} />
                    </View>
                </View>
                <View className="flex-row justify-between mt-1">
                    <Text className="text-xs text-gray-500">0-3</Text>
                    <Text className="text-xs text-gray-500">4-7</Text>
                    <Text className="text-xs text-gray-500">8-10</Text>
                </View>
            </View>
        </View>
    );
};
