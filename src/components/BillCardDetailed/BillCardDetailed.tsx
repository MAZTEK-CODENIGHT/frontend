import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import moment from 'moment';
import 'moment/locale/tr';
import { useNavigation } from '@react-navigation/native';

type BillCardDetailedProps = {
  data: {
    bill: {
      period_start: string;
      total_amount: number;
      taxes: number;
      subtotal: number;
    };
    items: {
      category: string;
      subtype: string;
      description: string;
      amount: number;
    }[];
    summary: {
      total: number;
    };
  };
};

const BillCardDetailed = ({ data }: BillCardDetailedProps) => {
  const navigation = useNavigation();

  if (!data || !data.bill || !data.items) {
    return <Text style={styles.errorText}>Fatura verisi bulunamadı.</Text>;
  }

  const { bill, items, summary } = data;

  const packageItems = items.filter(
    (item) => item.subtype === 'base_plan' || item.subtype === 'monthly_allowance'
  );

  const overageItems = items.filter(
    (item) => item.subtype !== 'base_plan' && item.subtype !== 'monthly_allowance'
  );

  const packageTotal = packageItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {moment(bill.period_start).locale('tr').format('MMMM YYYY')} Faturası
        </Text>
      </View>

      {/* Paket Detayları */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Image
            source={require('../../assets/package.png')}
            style={styles.sectionIcon}
          />
          <Text style={styles.sectionTitle}>Genç Tarife</Text>
          <Text style={styles.sectionAmount}>{packageTotal}₺</Text>
        </View>
        {packageItems.map((item) => (
          <View key={item._id} style={styles.detailItem}>
            <Text style={styles.detailText}>{item.description}</Text>
          </View>
        ))}
      </View>

      {/* Diğer Harcamalar */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Image
            source={require('../../assets/tax.png')}
            style={styles.sectionIcon}
          />
          <Text style={styles.sectionTitle}>Diğer Harcamalar</Text>
          <Text style={styles.sectionAmount}>{overageItems.reduce((sum, item) => sum + item.amount, 0)}₺</Text>
        </View>
        {overageItems.map((item) => (
          <View key={item._id} style={styles.detailItem}>
            <Text style={styles.detailText}>{item.description}</Text>
            <Text style={styles.detailText}>{item.amount}₺</Text>
          </View>
        ))}
      </View>

      {/* Vergiler */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Image
            source={require('../../assets/tax.png')}
            style={styles.sectionIcon}
          />
          <Text style={styles.sectionTitle}>Vergiler</Text>
          <Text style={styles.sectionAmount}>{bill.taxes}₺</Text>
        </View>
      </View>

      {/* Toplam */}
      <View style={styles.totalSection}>
        <Text style={styles.totalText}>TOPLAM</Text>
        <Text style={styles.totalAmount}>{summary.total}₺</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#000',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 10, // Kenarlardan boşluk bırakır
    marginTop: 20,
    // flex: 1 ve ScrollView kaldırıldı
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#1c1c1e',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    tintColor: '#fff',
  },
  sectionTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionAmount: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 34,
    marginTop: 5,
  },
  detailText: {
    color: '#b0b0b0',
    fontSize: 14,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 15,
  },
  totalText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalAmount: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default BillCardDetailed;