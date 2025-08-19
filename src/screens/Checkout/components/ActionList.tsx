import React from 'react';
import { View, Text } from 'react-native';

interface WhatIfScenario {
    plan_id?: number;
    addons?: number[];
    disable_vas?: boolean;
    block_premium_sms?: boolean;
    enable_roaming_block?: boolean;
}

interface ActionListProps {
    scenario: WhatIfScenario;
}

export const ActionList: React.FC<ActionListProps> = ({ scenario }) => {
    const getActionDescription = (action: string, value: any) => {
        switch (action) {
            case 'plan_id':
                return `Plan değişikliği: Plan ID ${value}`;
            case 'addons':
                return `Ek paketler eklenecek: ${value.length} adet`;
            case 'disable_vas':
                return value ? 'VAS servisleri iptal edilecek' : 'VAS servisleri korunacak';
            case 'block_premium_sms':
                return value ? 'Premium SMS bloklaması aktifleştirilecek' : 'Premium SMS bloklaması değişmeyecek';
            case 'enable_roaming_block':
                return value ? 'Yurt dışı kullanım bloklaması aktifleştirilecek' : 'Yurt dışı kullanım bloklaması değişmeyecek';
            default:
                return 'Bilinmeyen aksiyon';
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'plan_id':
                return '📱';
            case 'addons':
                return '📦';
            case 'disable_vas':
                return '🎵';
            case 'block_premium_sms':
                return '🚫';
            case 'enable_roaming_block':
                return '✈️';
            default:
                return '❓';
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'plan_id':
                return 'bg-blue-100 border-blue-300';
            case 'addons':
                return 'bg-green-100 border-green-300';
            case 'disable_vas':
                return 'bg-purple-100 border-purple-300';
            case 'block_premium_sms':
                return 'bg-orange-100 border-orange-300';
            case 'enable_roaming_block':
                return 'bg-red-100 border-red-300';
            default:
                return 'bg-gray-100 border-gray-300';
        }
    };

    const actions = Object.entries(scenario).filter(([_, value]) => {
        if (Array.isArray(value)) return value.length > 0;
        return value !== undefined && value !== false;
    });

    if (actions.length === 0) {
        return (
            <View className="bg-white rounded-xl m-4 p-6 shadow-lg">
                <Text className="text-xl font-bold text-gray-900 mb-4">Uygulanacak Aksiyonlar</Text>
                <View className="bg-gray-50 rounded-lg p-4">
                    <Text className="text-gray-600 text-center">Henüz aksiyon seçilmedi</Text>
                </View>
            </View>
        );
    }

    return (
        <View className="bg-white rounded-xl m-4 p-6 shadow-lg">
            <Text className="text-xl font-bold text-gray-900 mb-4">Uygulanacak Aksiyonlar</Text>

            <View className="space-y-3">
                {actions.map(([action, value]) => (
                    <View key={action} className={`rounded-lg p-4 border ${getActionColor(action)}`}>
                        <View className="flex-row items-center">
                            <Text className="text-2xl mr-3">{getActionIcon(action)}</Text>
                            <View className="flex-1">
                                <Text className="font-medium text-gray-800">
                                    {getActionDescription(action, value)}
                                </Text>
                                <Text className="text-sm text-gray-600 mt-1">
                                    {action === 'addons' ? `${value.length} paket seçildi` : 'Bir sonraki fatura döneminde aktif olacak'}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {/* Summary */}
            <View className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
                <Text className="text-blue-800 font-medium text-center">
                    Toplam {actions.length} aksiyon uygulanacak
                </Text>
                <Text className="text-blue-600 text-sm text-center mt-1">
                    Değişiklikler bir sonraki fatura döneminde aktif olacaktır
                </Text>
            </View>
        </View>
    );
};
