import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  FlatList,
  Text,
  View,
  Image,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ScrollView } from 'react-native-gesture-handler';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const avatar = require('../assets/avatar.jpg');
const SPACING = 10;
const colors = {
  light: '#f0f0f0',
  'dark-gray': '#333333',
  black: '#000000',
  yellow: '#FFD700',
};
const gradient = [colors['dark-gray'], colors.black];
const { width } = Dimensions.get('window');

const AccueilScreen = () => {
  const [cars, setCars] = useState([]);
  const [favourites, setFavourites] = useState(new Set());
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([
    { name: 'Maserati', logo: 'https://pngimg.com/d/maserati_PNG64.png', count: 5 },
    { name: 'Mercedes', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/2048px-Mercedes-Logo.svg.png', count: 32 },
    { name: 'TOGG', logo: 'https://www.farplas.com/wp-content/uploads/2021/10/10.png', count: 8 },
    { name: 'Porsche', logo: 'https://logos-world.net/wp-content/uploads/2021/06/Porsche-Logo.png', count: 8 },
  ]);

  useEffect(() => {
    fetchCars();
    fetchUser();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await axios.get('http://192.168.1.185:3001/cars?page=1&limit=4');
      setCars(response.data.data);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      const response = await axios.get(`http://192.168.1.185:3001/users/clients/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavourite = async (carId) => {
    const isFavourite = favourites.has(carId);
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');

      if (!isFavourite) {
        // Add favorite
        await axios.post('http://192.168.1.185:3001/favorite-cars', {
          idClient: userId,
          idVoiture: carId
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setFavourites(prev => new Set(prev).add(carId));
      } else {
        // Remove favorite
        await axios.delete('http://192.168.1.185:3001/favorite-cars', {
          data: { idClient: userId, idVoiture: carId },
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setFavourites(prev => {
          const newFavourites = new Set(prev);
          newFavourites.delete(carId);
          return newFavourites;
        });
      }
    } catch (error) {
      console.error('Error toggling favourite:', error);
      Alert.alert(
        'An error occurred while toggling favourite status:',
        error.response?.data?.message || error.message
      );
    }
  };
  const renderBrandItem = ({ item }) => (
    <LinearGradient
      colors={[colors['dark-gray'], colors.black]} // Gradient colors
      style={styles.brandCard}
    >
      <Image source={{ uri: item.logo }} style={styles.brandLogo} />
      <Text style={styles.brandText}>{item.name}</Text>
      <Text style={styles.brandCount}>+{item.count}</Text>
    </LinearGradient>
  );
  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <LinearGradient
            style={{
              height: SPACING * 4,
              width: SPACING * 4,
              borderRadius: SPACING * 2,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            colors={[colors.light, colors['dark-gray']]}>
            <TouchableOpacity
              style={{
                height: SPACING * 3,
                width: SPACING * 3,
                backgroundColor: colors.black,
                borderRadius: SPACING * 1.5,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <MaterialCommunityIcons
                name="dots-horizontal"
                color={colors.light}
                size={SPACING * 2}
              />
            </TouchableOpacity>
          </LinearGradient>
          <LinearGradient
            style={{
              height: SPACING * 4,
              width: SPACING * 4,
              borderRadius: SPACING * 2,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            colors={[colors.light, colors['dark-gray']]}>
            <TouchableOpacity
              style={{
                height: SPACING * 3,
                width: SPACING * 3,
                backgroundColor: colors.black,
                borderRadius: SPACING * 1.5,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Image
                source={{ uri: userData?.image || 'https://via.placeholder.com/50' }}
                style={{
                  height: '100%',
                  width: '100%',
                  borderRadius: SPACING * 1.5,
                }}
              />
            </TouchableOpacity>
          </LinearGradient>
        </View>
        <View
          style={{
            position: 'relative',
            marginVertical: SPACING * 3,
            justifyContent: 'center',
          }}>
          <TextInput
            style={{
              backgroundColor: colors['dark-gray'],
              padding: SPACING * 1.5,
              borderRadius: SPACING * 2,
              color: colors.light,
              fontSize: SPACING * 2,
              paddingLeft: SPACING * 4,
            }}
            placeholder="Search"
            placeholderTextColor={colors.light}
          />
          <Ionicons
            style={{
              position: 'absolute',
              left: SPACING,
            }}
            size={SPACING * 2.5}
            color={colors.light}
            name="search"
          />
        </View>
        <LinearGradient
          colors={gradient}
          style={{
            padding: SPACING * 3,
            height: 165,
            borderRadius: SPACING * 2,
            flexDirection: 'row',
          }}>
          <View
            style={{
              maxWidth: '50%',
            }}>
            <Text
              style={{
                color: colors.light,
                fontSize: SPACING * 3.5,
                fontWeight: '800',
                marginBottom: SPACING,
              }}>
              20%
            </Text>
            <Text
              style={{
                color: colors.light,
                fontWeight: '700',
                fontSize: SPACING * 2,
                marginBottom: SPACING,
              }}>
              New Arrival
            </Text>
            <Text
              style={{
                color: colors.light,
              }}>
              Get a new car discount, only valid this Friday
            </Text>
          </View>
          <View
            style={{
              width: '70%',
              position: 'relative',
            }}>
            <Image
              style={{
                width: '100%',
                height: '100%',
              }}
              source={require('../assets/bmw.png')}
            />
          </View>
        </LinearGradient>
        <View
          style={{
            marginVertical: SPACING * 2,
          }}>
          <Text
            style={{
              color: colors.black,
              fontSize: SPACING * 2.5,
              fontWeight: '600',
            }}>
            Top Deals
          </Text>
          <View
            style={{
              marginTop: SPACING * 2,
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}>
            {Array.isArray(cars) && cars.map((car) => (
              <LinearGradient
                key={car._id}
                colors={gradient}
                style={{
                  height: 230,
                  width: width / 2 - SPACING * 3,
                  borderRadius: SPACING * 2,
                  marginBottom: SPACING * 2,
                  padding: SPACING,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Ionicons
                      name="star"
                      color={colors.yellow}
                      size={SPACING * 1.6}
                    />
                    <Text
                      style={{
                        color: colors.light,
                        marginLeft: SPACING / 2,
                      }}>
                      {/* {car.rating} */} 4.8
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleFavourite(car._id)}>
                    <Ionicons
                      name={favourites.has(car._id) ? 'heart' : 'heart-outline'}
                      color={colors.light}
                      size={SPACING * 2}
                    />
                  </TouchableOpacity>
                </View>
                <Image
                  style={{
                    width: '100%',
                    height: '50%',
                  }}
                  source={{ uri: car.image }}
                  resizeMode="contain"
                />
                <Text
                  style={{
                    fontSize: SPACING * 1.8,
                    color: colors.light,
                  }}>
                  {car.marque} {car.modele}
                </Text>
                <View
                  style={{
                    marginVertical: SPACING,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      color: colors.light,
                      fontSize: SPACING * 1.5,
                    }}>
                    $ {car.prixParJ}
                  </Text>
                  <TouchableOpacity
                    style={{
                      borderRadius: SPACING / 2,
                      overflow: 'hidden',
                    }}>
                    <LinearGradient
                      style={{
                        padding: SPACING / 3,
                        paddingHorizontal: SPACING / 2,
                      }}
                      colors={[colors['dark-gray'], colors.black]}>
                      <Ionicons
                        name="arrow-forward"
                        size={SPACING * 2}
                        color={colors.light}
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            ))}
          </View>
        </View>
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
    </SafeAreaView>
  );
};

export default AccueilScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING,
    backgroundColor: colors.light,
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
    color: '#fff',
    textAlign: 'center',
  },
  brandCount: {
    color: '#1E90FF',
    fontWeight: 'bold',
  },
});
