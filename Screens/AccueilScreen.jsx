import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';

const AccueilScreen = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([
    { name: 'Maserati', logo: 'https://example.com/maserati.png', count: 5 },
    { name: 'Mercedes', logo: 'https://example.com/mercedes.png', count: 32 },
    { name: 'TOGG', logo: 'https://example.com/togg.png', count: 8 },
    { name: 'Porsche', logo: 'https://example.com/porsche.png', count: 8 },
  ]);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await axios.get(
        'http://192.168.1.185:3001/cars?page=1&limit=3'
      );
      setCars(response.data.data);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCarItem = ({ item, index }) => (
    <View style={styles.carCard}>
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        onError={() => console.log('Failed to load image:', item.image)}
      />
      <View style={styles.carInfo}>
        <Text style={styles.title}>
          {item.marque} {item.modele} {item.anneeFabrication}
        </Text>
        <Text style={styles.price}>${item.prixParJ} /day</Text>
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Icon name="speedometer-outline" size={20} color="#333" />
            <Text style={styles.details}>{item.kilometrage} km</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="snow-outline" size={20} color="#333" />
            <Text style={styles.details}>
              {item.climatisation ? 'A/C' : 'No A/C'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderBrandItem = ({ item }) => (
    <View style={styles.brandCard}>
      <Image source={{ uri: item.logo }} style={styles.brandLogo} />
      <Text style={styles.brandText}>{item.name}</Text>
      <Text style={styles.brandCount}>+{item.count}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Car Listings</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={cars}
          renderItem={renderCarItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.carList}
          scrollEnabled={false}
        />
      )}
      <View style={styles.brandSection}>
        <Text style={styles.brandTitle}>Brands</Text>
        <FlatList
          data={brands}
          renderItem={renderBrandItem}
          keyExtractor={(item) => item.name}
          horizontal
          contentContainerStyle={styles.brandList}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  carList: {
    paddingBottom: 20,
  },
  carCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
  },
  carInfo: {
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  details: {
    fontSize: 14,
    color: '#333',
    marginLeft: 5,
  },
  brandSection: {
    marginTop: 20,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  brandList: {
    paddingBottom: 20,
    marginBottom:20,
  },
  brandCard: {
    width: 100,
    alignItems: 'center',
    marginRight: 10,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  brandLogo: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  brandText: {
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  brandCount: {
    color: '#1E90FF',
    fontWeight: 'bold',
  },
});

export default AccueilScreen;
