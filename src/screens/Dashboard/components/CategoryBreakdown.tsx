import React from 'react';
import { View, Text, ScrollView } from 'react-native';

interface BillItem {
    item_id: string;
    category: string;
    amount: number;
    description: string;
}

interface CategoryBreakdownProps {
    items: BillItem[];
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ items }) => {
    const getCategoryData = () => {
        const categories = items.reduce((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = {
                    total: 0,
                    items: []
                };
            }
            acc[item.category].total += item.amount;
            acc[item.category].items.push(item);
            return acc;
        }, {} as Record<string, { total: number; items: BillItem[] }>);

        const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

        return Object.entries(categories).map(([category, data]) => ({
            category,
            total: data.total,
            percentage: ((data.total / totalAmount) * 100).toFixed(1),
            items: data.items
        }));
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            data: '#3b82f6',
            voice: '#10b981',
            sms: '#8b5cf6',
            roaming: '#ef4444',
            premium_sms: '#f59e0b',
            vas: '#6366f1',
            one_off: '#6b7280',
            discount: '#059669',
            tax: '#eab308'
        };
        return colors[category] || '#6b7280';
    };

    const getCategoryName = (category: string) => {
        const names: Record<string, string> = {
            data: 'Veri',
            voice: 'Ses',
            sms: 'SMS',
            roaming: 'Yurt Dışı',
            premium_sms: 'Premium SMS',
            vas: 'VAS',
            one_off: 'Tek Seferlik',
            discount: 'İndirim',
            tax: 'Vergi'
        };
        return names[category] || category;
    };

    const categoryData = getCategoryData();

    return (
        <View style={{ backgroundColor: 'white', borderRadius: 12, margin: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>Kategori Dağılımı</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row' }}>
                    {categoryData.map((cat) => (
                        <View key={cat.category} style={{ backgroundColor: '#f9fafb', borderRadius: 8, padding: 16, margin: 8, minWidth: 120 }}>
                            <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: getCategoryColor(cat.category), marginBottom: 8 }} />
                            <Text style={{ fontSize: 14, color: '#6b7280', textTransform: 'uppercase', fontWeight: '500' }}>
                                {getCategoryName(cat.category)}
                            </Text>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>
                                ₺{cat.total.toFixed(2)}
                            </Text>
                            <Text style={{ fontSize: 12, color: '#9ca3af' }}>
                                %{cat.percentage}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Detailed List */}
            <View style={{ marginTop: 24 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 }}>Detaylı Liste</Text>
                {categoryData.map((cat) => (
                    <View key={cat.category} style={{ marginBottom: 16 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Text style={{ fontWeight: '500', color: '#374151' }}>
                                {getCategoryName(cat.category)}
                            </Text>
                            <Text style={{ fontWeight: 'bold', color: '#111827' }}>
                                ₺{cat.total.toFixed(2)}
                            </Text>
                        </View>
                        {cat.items.map((item) => (
                            <View key={item.item_id} style={{ marginLeft: 16, marginBottom: 4 }}>
                                <Text style={{ fontSize: 14, color: '#4b5563' }}>
                                    • {item.description}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>
                                    ₺{item.amount.toFixed(2)}
                                </Text>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );
};
