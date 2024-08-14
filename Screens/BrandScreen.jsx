import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

const SPACING = 10;
const colors = {
  light: '#f0f0f0',
  'dark-gray': '#333333',
  black: '#000000',
  yellow: '#FFD700',
  white: '#ffffff',
  gray: '#888888',
};

const BrandScreen = ({ route, navigation }) => {
  const { marque } = route.params;
  const [cars, setCars] = useState([]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await axios.get(`http://192.168.1.185:3001/cars/search/search?marque=${marque}`);
        setCars(response.data);
      } catch (error) {
        console.error('Error fetching car data:', error);
      }
    };

    fetchCars();
  }, [marque]);

  const renderCarItem = ({ item }) => (
    <View style={styles.carCard}>
      <Image source={{ uri: item.image }} style={styles.carImage} />
      <Text style={styles.carName}>{item.modele} {item.marque}</Text>
      <View style={styles.carDetails}>
        <Text style={styles.carCategory}>{item.categorie}</Text>
        <View style={styles.noveltyAttributes}>
          <View style={styles.noveltyAttribute}>
            <Image source={require('../assets/Miles.png')} style={styles.noveltyattributeIcon} />
            <Text style={styles.noveltyattributeText}>{item.kilometrage} Miles</Text>
          </View>
          <View style={styles.noveltyAttribute}>
            <Image source={require('../assets/Petrol.png')} style={styles.noveltyattributeIcon} />
            <Text style={styles.noveltyattributeText}>{item.typeCarburant}</Text>
          </View>
          <View style={styles.noveltyAttribute}>
            <Image source={require('../assets/Automatic.png')} style={styles.noveltyattributeIcon} />
            <Text style={styles.noveltyattributeText}>{item.typeTransmission}</Text>
          </View>
          <View style={styles.noveltyAttribute}>
            <Image source={require('../assets/cal.png')} style={styles.noveltyattributeIcon} />
            <Text style={styles.noveltyattributeText}>{item.anneeFabrication}</Text>
          </View>
        </View>
        <View style={styles.carFooter}>
          <Text style={styles.carPrice}>${item.prixParJ} / day</Text>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => navigation.navigate('Info', { id: item._id })}
          >
            <LinearGradient
              style={styles.gradientButton}
              colors={[colors['dark-gray'], colors.black]}
            >
              <Ionicons name="arrow-forward" size={SPACING * 2} color={colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{marque} Cars</Text>
      <FlatList
        data={cars}
        renderItem={renderCarItem}
        keyExtractor={item => item._id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
    padding: SPACING,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SPACING,
    color: colors.black,
  },
  carCard: {
    marginBottom: SPACING,
    borderRadius: 12,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    padding: SPACING,
  },
  carImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: SPACING,
  },
  carName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: SPACING / 2,
  },
  carDetails: {
    marginTop: SPACING / 2,
  },
  carCategory: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: SPACING,
  },
  noveltyAttributes: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    flexWrap: 'wrap',
    marginBottom: SPACING,
    width: '100%',
  },
  noveltyAttributes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING,
    justifyContent: 'space-between', 
  },
  noveltyAttribute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING / 2,
    width: '48%', 
  },
  noveltyattributeIcon: {
    width: SPACING * 1.8,
    height: SPACING * 1.8, 
    marginRight: SPACING / 2,
    alignSelf: 'center',
  },
  noveltyattributeText: {
    fontSize: SPACING * 1.4, 
    alignSelf: 'center',
  },
  carFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  infoButton: {
    borderRadius: SPACING / 2,
    overflow: 'hidden',
  },
  gradientButton: {
    padding: SPACING / 3,
    paddingHorizontal: SPACING / 2,
  },
});

export default BrandScreen;
