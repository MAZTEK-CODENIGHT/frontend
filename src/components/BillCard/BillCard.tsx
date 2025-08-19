import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import moment from 'moment';
import 'moment/locale/tr';
import { useNavigation } from '@react-navigation/native';

type BillCardProps = {
  data: {
    bill: {
      period_start: string;
      total_amount: number;
      taxes: number;
    };
    items: {
      category: string;
      subtype: string;
      description: string;
      amount: number;
    }[];
  };
};

const BillCard = ({ data }: BillCardProps) => {
  const navigation = useNavigation();

  if (!data || !data.bill || !data.items) {
    return <Text style={{ color: 'red' }}>Fatura verisi yüklenemedi.</Text>;
  }

  const { bill, items } = data;

  const packageItems = items.filter(
    (item) => item.subtype === 'base_plan' || item.subtype === 'monthly_allowance'
  );
  const otherItems = items.filter(
    (item) => item.subtype !== 'base_plan' && item.subtype !== 'monthly_allowance'
  );

  const packageTotal = packageItems.reduce((sum, item) => sum + item.amount, 0);
  const otherTotal = otherItems.reduce((sum, item) => sum + item.amount, 0);
  const taxesTotal = bill.taxes;
  const totalBillAmount = bill.total_amount;

  const handlePress = () => {
    navigation.navigate('BillDetail', { billData: data });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {moment(bill.period_start).locale('tr').format('MMMM YYYY')} Faturası
      </Text>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Image
            source={require('../../assets/package.png')}
            style={styles.sectionIcon}
          />
          <Text style={styles.sectionTitle}>Genç Tarife</Text>
          <Text style={styles.sectionAmount}>{packageTotal}₺</Text>
        </View>
        {packageItems.map((item, index) => (
          <Text key={index} style={styles.itemText}>
            • {item.description}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Image
            source={require('../../assets/tax.png')}
            style={styles.sectionIcon}
          />
          <Text style={styles.sectionTitle}>Diğer Harcamalar</Text>
          <Text style={styles.sectionAmount}>{otherTotal}₺</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Image
            source={require('../../assets/tax.png')}
            style={styles.sectionIcon}
          />
          <Text style={styles.sectionTitle}>Vergiler</Text>
          <Text style={styles.sectionAmount}>{taxesTotal}₺</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Detaylı Göster</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    borderRadius: 20,
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
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
    justifyContent: 'space-between',
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
  itemText: {
    color: '#b0b0b0',
    fontSize: 14,
    marginLeft: 34,
    marginTop: 5,
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BillCard;