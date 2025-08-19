import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';

interface WhatIfScenario {
    plan_id?: number;
    addons?: number[];
    disable_vas?: boolean;
    block_premium_sms?: boolean;
    enable_roaming_block?: boolean;
}

interface ScenarioBuilderProps {
    scenario: WhatIfScenario;
    catalog: any;
    onScenarioChange: (scenario: WhatIfScenario) => void;
}

export const ScenarioBuilder: React.FC<ScenarioBuilderProps> = ({
    scenario,
    catalog,
    onScenarioChange
}) => {
    const updateScenario = (updates: Partial<WhatIfScenario>) => {
        onScenarioChange({ ...scenario, ...updates });
    };

    const toggleAddon = (addonId: number) => {
        const currentAddons = scenario.addons || [];
        const newAddons = currentAddons.includes(addonId)
            ? currentAddons.filter(id => id !== addonId)
            : [...currentAddons, addonId];

        updateScenario({ addons: newAddons });
    };

    const isAddonSelected = (addonId: number) => {
        return (scenario.addons || []).includes(addonId);
    };

    return (
        <View className="bg-white rounded-xl m-4 p-6 shadow-lg">
            <Text className="text-xl font-bold text-gray-900 mb-4">Senaryo Oluşturucu</Text>

            {/* Plan Selection */}
            <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-800 mb-3">Plan Değişikliği</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row">
                        {catalog?.plans?.map((plan: any) => (
                            <TouchableOpacity
                                key={plan.plan_id}
                                className={`rounded-lg p-4 m-2 min-w-[150px] border-2 ${scenario.plan_id === plan.plan_id
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-200 bg-gray-50'
                                    }`}
                                onPress={() => updateScenario({ plan_id: plan.plan_id })}
                            >
                                <Text className={`font-bold text-lg ${scenario.plan_id === plan.plan_id ? 'text-blue-600' : 'text-gray-700'
                                    }`}>
                                    {plan.plan_name}
                                </Text>
                                <Text className={`text-sm ${scenario.plan_id === plan.plan_id ? 'text-blue-500' : 'text-gray-500'
                                    }`}>
                                    {plan.quota_gb}GB • {plan.quota_min}dk
                                </Text>
                                <Text className={`font-semibold ${scenario.plan_id === plan.plan_id ? 'text-blue-600' : 'text-gray-700'
                                    }`}>
                                    ₺{plan.monthly_price}/ay
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Add-on Selection */}
            <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-800 mb-3">Ek Paketler</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row">
                        {catalog?.addons?.map((addon: any) => (
                            <TouchableOpacity
                                key={addon.addon_id}
                                className={`rounded-lg p-4 m-2 min-w-[120px] border-2 ${isAddonSelected(addon.addon_id)
                                        ? 'border-green-600 bg-green-50'
                                        : 'border-gray-200 bg-gray-50'
                                    }`}
                                onPress={() => toggleAddon(addon.addon_id)}
                            >
                                <Text className={`font-bold ${isAddonSelected(addon.addon_id) ? 'text-green-600' : 'text-gray-700'
                                    }`}>
                                    {addon.name}
                                </Text>
                                <Text className={`text-sm ${isAddonSelected(addon.addon_id) ? 'text-green-500' : 'text-gray-500'
                                    }`}>
                                    +{addon.extra_gb}GB • +{addon.extra_min}dk
                                </Text>
                                <Text className={`font-semibold ${isAddonSelected(addon.addon_id) ? 'text-green-600' : 'text-gray-700'
                                    }`}>
                                    ₺{addon.price}/ay
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Service Controls */}
            <View className="space-y-4">
                <Text className="text-lg font-semibold text-gray-800 mb-3">Servis Kontrolleri</Text>

                {/* VAS Disable */}
                <View className="flex-row items-center justify-between bg-gray-50 rounded-lg p-4">
                    <View className="flex-1">
                        <Text className="font-medium text-gray-700">VAS Servislerini İptal Et</Text>
                        <Text className="text-sm text-gray-500">Caller Tunes, Müzik Paketi vb.</Text>
                    </View>
                    <Switch
                        value={scenario.disable_vas || false}
                        onValueChange={(value) => updateScenario({ disable_vas: value })}
                        trackColor={{ false: '#d1d5db', true: '#10b981' }}
                        thumbColor={scenario.disable_vas ? '#ffffff' : '#ffffff'}
                    />
                </View>

                {/* Premium SMS Block */}
                <View className="flex-row items-center justify-between bg-gray-50 rounded-lg p-4">
                    <View className="flex-1">
                        <Text className="font-medium text-gray-700">Premium SMS Bloklaması</Text>
                        <Text className="text-sm text-gray-500">Oyun, eğlence servisleri</Text>
                    </View>
                    <Switch
                        value={scenario.block_premium_sms || false}
                        onValueChange={(value) => updateScenario({ block_premium_sms: value })}
                        trackColor={{ false: '#d1d5db', true: '#f59e0b' }}
                        thumbColor={scenario.block_premium_sms ? '#ffffff' : '#ffffff'}
                    />
                </View>

                {/* Roaming Block */}
                <View className="flex-row items-center justify-between bg-gray-50 rounded-lg p-4">
                    <View className="flex-1">
                        <Text className="font-medium text-gray-700">Yurt Dışı Kullanım Bloklaması</Text>
                        <Text className="text-sm text-gray-500">Roaming ücretlerini engelle</Text>
                    </View>
                    <Switch
                        value={scenario.enable_roaming_block || false}
                        onValueChange={(value) => updateScenario({ enable_roaming_block: value })}
                        trackColor={{ false: '#d1d5db', true: '#ef4444' }}
                        thumbColor={scenario.enable_roaming_block ? '#ffffff' : '#ffffff'}
                    />
                </View>
            </View>
        </View>
    );
};
