import React, {useState, useEffect, useRef} from 'react';
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
  Animated,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {ScrollView} from 'react-native-gesture-handler';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {API_URL} from 'react-native-dotenv';
import Config from 'react-native-config';

const avatar = require('../assets/avatar.jpg');
const SPACING = 10;
const colors = {
  light: '#f0f0f0',
  'dark-gray': '#333333',
  black: '#000000',
  yellow: '#FFD700',
};
const gradient = ['#FFFFFF', '#FFFFFF'];
const {width} = Dimensions.get('window');

const HomeScreen = () => {
  const [cars, setCars] = useState([]);
  const [favourites, setFavourites] = useState(new Set());
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [noveltyCars, setNoveltyCars] = useState([]);

  const handleScroll = event => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / (width * 0.8 + SPACING * 2),
    );
    setActiveIndex(index);
  };
  const [brands, setBrands] = useState([
    {
      name: 'Maserati',
      logo: 'https://pngimg.com/d/maserati_PNG64.png',
      count: 5,
    },
    {
      name: 'Mercedes',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/2048px-Mercedes-Logo.svg.png',
      count: 32,
    },
    {
      name: 'TOGG',
      logo: 'https://www.farplas.com/wp-content/uploads/2021/10/10.png',
      count: 8,
    },
    {
      name: 'Porsche',
      logo: 'https://logos-world.net/wp-content/uploads/2021/06/Porsche-Logo.png',
      count: 8,
    },
    {
      name: 'BMW',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/768px-BMW.svg.png',
      count: 8,
    },
  ]);

  useEffect(() => {
    fetchCars();
    fetchUser();
    fetchNoveltyCars();
  }, [favourites]);

  const fetchCars = async () => {
    try {
      const response = await axios.get(`${Config.API_URL}/cars?page=1&limit=4`);
      const carsData = response.data.data.map(car => {
        const carImageUrl = car.image;
        if (carImageUrl.includes('http://localhost:3001')) {
          car.image = carImageUrl.replace(
            'http://localhost:3001',
            'http://10.0.2.2:3001',
          );
        }
        return car;
      });
      setCars(carsData);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchFavourites = async (userId, token) => {
    try {
      const response = await axios.get(
        `${Config.API_URL}/favorite-cars/client/${userId}`,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      const favouriteCars = response.data.map(fav => fav.idVoiture);
      setFavourites(new Set(favouriteCars));
    } catch (error) {
      console.error('Error fetching favourite cars:', error);
    }
  };

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      const response = await axios.get(
        `${Config.API_URL}/users/clients/${userId}`,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      setUserData(response.data);
      fetchFavourites(userId, token);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavourite = async carId => {
    const isFavourite = favourites.has(carId);
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');

      if (!isFavourite) {
        // Add favorite
        await axios.post(
          `${Config.API_URL}/favorite-cars`,
          {
            idClient: userId,
            idVoiture: carId,
          },
          {
            headers: {Authorization: `Bearer ${token}`},
          },
        );
        setFavourites(prev => new Set(prev).add(carId));
      } else {
        // Remove favorite
        await axios.delete(`${Config.API_URL}/favorite-cars`, {
          data: {idClient: userId, idVoiture: carId},
          headers: {Authorization: `Bearer ${token}`},
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
        error.response?.data?.message || error.message,
      );
    }
  };

  const renderBrandItem = ({item}) => {
    const handleBrandPress = () => {
      navigation.navigate('BrandScreen', {marque: item.name});
    };

    return (
      <TouchableOpacity onPress={handleBrandPress}>
        <LinearGradient colors={['#fff', '#fff']} style={styles.brandCard}>
          <Image source={{uri: item.logo}} style={styles.brandLogo} />
          <Text style={styles.brandText}>{item.name}</Text>
          <Text style={styles.brandCount}>+{item.count}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const navigation = useNavigation();

  const navigateToCars = () => {
    navigation.navigate('Cars');
  };

  const data = [
    {
      id: 1,
      discount: '30%',
      title: 'Electrical Cars',
      description: 'Get a new car discount',
      image: require('../assets/tesla.png'),
      gradientColors: ['#60A23C', '#97DA6F'],
    },
    {
      id: 2,
      discount: '20%',
      title: 'New Arrival',
      description: 'Get a new car discount, only valid this Friday',
      image: require('../assets/bmw.png'),
      gradientColors: ['#3563E9', '#5CAFFC'],
    },
    {
      id: 3,
      discount: '50%',
      title: 'New Offer',
      description: 'Get a new car discount, only valid this Friday',
      image: require('../assets/audi.png'),
      gradientColors: ['#965A33', '#a1887f'],
    },
  ];
  const fetchNoveltyCars = async () => {
    try {
      const response = await axios.get(
        `${Config.API_URL}/cars?page=1&limit=3&sort=created_at:desc`,
      );
  
      // Récupérer les données des voitures
      const cars = response.data.data;
  
      // Modifier l'URL de l'image pour chaque voiture si nécessaire
      const updatedCars = cars.map(car => {
        const carImageUrl = car.image;
        if (carImageUrl.includes("http://localhost:3001")) {
          car.image = carImageUrl.replace("http://localhost:3001", "http://10.0.2.2:3001");
        }
        return car;
      });
  
      // Mettre à jour l'état `noveltyCars` avec les données modifiées
      setNoveltyCars(updatedCars);
    } catch (error) {
      console.error('Error fetching novelty cars:', error);
    }
  };

  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(colorAnim, {
        toValue: 1,
        duration: 3600,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ).start();
  }, [colorAnim]);

  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
    outputRange: [
      '#1ECB15',
      '#3baea0',
      '#118a7e',
      '#2c5d63',
      '#1f6f78',
      '#1ECB15',
    ],
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            position: 'relative',
            marginVertical: SPACING * 3,
            justifyContent: 'center',
          }}>
          <TextInput
            style={{
              backgroundColor: '#D3D3D3',
              padding: SPACING * 1.5,
              borderRadius: SPACING * 2,
              color: colors.black,
              fontSize: SPACING * 2,
              paddingLeft: SPACING * 4,
            }}
            placeholder="Search"
            placeholderTextColor="#808080"
          />
          <Ionicons
            style={{
              position: 'absolute',
              left: SPACING,
            }}
            size={SPACING * 2.5}
            color="#808080"
            name="search"
          />
        </View>
        <Text
          style={{
            color: colors.black,
            fontSize: SPACING * 2.5,
            fontWeight: '600',
            marginBottom: 10,
          }}>
          Top Deals
        </Text>
        <View>
          <FlatList
            data={data}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={{paddingHorizontal: SPACING}}
            renderItem={({item}) => (
              <LinearGradient
                colors={item.gradientColors}
                style={{
                  padding: SPACING * 3,
                  height: 195,
                  borderRadius: SPACING * 2,
                  flexDirection: 'row',
                  marginBottom: 10,
                  marginRight: SPACING * 2,
                  width: width * 0.9, // Adjust the width of the cards
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
                    {item.discount}
                  </Text>
                  <Text
                    style={{
                      color: colors.light,
                      fontWeight: '700',
                      fontSize: SPACING * 2,
                      marginBottom: SPACING,
                    }}>
                    {item.title}
                  </Text>
                  <Text
                    style={{
                      color: colors.light,
                      paddingBottom: SPACING * 2,
                    }}>
                    {item.description}
                  </Text>
                </View>
                <View
                  style={{
                    width: '75%', //ilhem
                    position: 'relative',
                  }}>
                  <Image
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: SPACING * 2, // Adjust this value as needed
                    }}
                    source={item.image}
                    resizeMode="contain" // Ensure the image fits within the view
                  />
                </View>
              </LinearGradient>
            )}
            onScroll={handleScroll}
            pagingEnabled
            snapToAlignment="center"
            decelerationRate="fast"
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: SPACING,
            }}>
            {data.map((_, index) => (
              <View
                key={index}
                style={{
                  height: SPACING,
                  width: SPACING,
                  borderRadius: SPACING / 2,
                  backgroundColor: index === activeIndex ? '#000' : '#D3D3D3',
                  marginHorizontal: SPACING / 2,
                  marginBottom: 25,
                }}
              />
            ))}
          </View>
        </View>
        <View
          style={{
            marginVertical: SPACING * 2,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: colors.black,
                fontSize: SPACING * 2.5,
                fontWeight: '600',
              }}>
              Our Cars
            </Text>
            <TouchableOpacity onPress={navigateToCars}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  style={{
                    color: colors['dark-gray'], // or any color you prefer
                    fontWeight: '600',
                  }}>
                  See all
                </Text>
                <MaterialIcons
                  name="arrow-upward"
                  size={SPACING * 1.7}
                  color={colors['dark-gray']} // or any color you prefer
                  style={{transform: [{rotate: '45deg'}]}}
                />
              </View>
            </TouchableOpacity>
          </View>
          <View
            style={{
              marginTop: SPACING * 2,
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}>
            {Array.isArray(cars) &&
              cars.map(car => (
                <LinearGradient
                  key={car._id}
                  colors={gradient}
                  style={{
                    height: 230,
                    width: width / 2 - SPACING * 3,
                    borderRadius: SPACING * 2,
                    marginBottom: SPACING * 2,
                    padding: SPACING,
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 10},
                    shadowOpacity: 0.25,
                    shadowRadius: 10,
                    elevation: 5,
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
                          color: colors.black,
                          marginLeft: SPACING / 2,
                        }}>
                        {car.note.toFixed(2)}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => toggleFavourite(car._id)}>
                      <Ionicons
                        name={
                          favourites.has(car._id) ? 'heart' : 'heart-outline'
                        }
                        color={colors.black}
                        size={SPACING * 2}
                      />
                    </TouchableOpacity>
                  </View>
                  <Image
                    style={{
                      width: '100%',
                      height: '50%',
                    }}
                    source={{uri: car.image}}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      fontSize: SPACING * 1.8,
                      color: colors.black,
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
                        color: colors.black,
                        fontSize: SPACING * 1.5,
                      }}>
                      $ {car.prixParJ} /Day
                    </Text>
                    <TouchableOpacity
                      style={{
                        borderRadius: SPACING / 2,
                        overflow: 'hidden',
                      }}
                      onPress={() =>
                        navigation.navigate('Info', {id: car._id})
                      }>
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
        {/* Novelty Section */}
        <View style={styles.noveltySection}>
          <View style={styles.noveltyTitleWrapper}>
            <Text style={styles.noveltyTitle}>Latest Additions</Text>
          </View>

          <FlatList
            data={noveltyCars}
            keyExtractor={item => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.noveltyCard}
                onPress={() => navigation.navigate('Info', {id: item._id})}
                activeOpacity={0.95}>
                <View style={styles.noveltyCardImageWrapper}>
                  <Image
                    source={{uri: item.image}}
                    style={styles.noveltyImage}
                  />
                  <Animated.View
                    style={[styles.noveltyBadge, {backgroundColor}]}>
                    <Text style={styles.noveltyBadgeText}>New</Text>
                  </Animated.View>
                  <TouchableOpacity
                    style={styles.noveltyFavouriteButton}
                    onPress={() => toggleFavourite(item._id)}>
                    <View style={styles.iconBackground}>
                      <Ionicons
                        name={
                          favourites.has(item._id) ? 'heart' : 'heart-outline'
                        }
                        color={colors.black}
                        size={SPACING * 2}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={styles.noveltyInfo}>
                  <Text style={styles.noveltyCarName}>
                    {item.marque} {item.modele}
                  </Text>
                  <Text style={styles.noveltyCarCategory}>
                    {item.categorie}
                  </Text>
                  <View style={styles.noveltyAttributes}>
                    <View style={styles.noveltyAttribute}>
                      <Image
                        source={require('../assets/Miles.png')}
                        style={styles.noveltyAttributeIcon}
                      />
                      <Text style={styles.noveltyAttributeText}>
                        {item.kilometrage} Miles
                      </Text>
                    </View>
                    <View style={styles.noveltyAttribute}>
                      <Image
                        source={require('../assets/Petrol.png')}
                        style={styles.noveltyAttributeIcon}
                      />
                      <Text style={styles.noveltyAttributeText}>
                        {item.typeCarburant}
                      </Text>
                    </View>
                    <View style={styles.noveltyAttribute}>
                      <Image
                        source={require('../assets/Automatic.png')}
                        style={styles.noveltyAttributeIcon}
                      />
                      <Text style={styles.noveltyAttributeText}>
                        {item.typeTransmission}
                      </Text>
                    </View>
                    <View style={styles.noveltyAttribute}>
                      <Image
                        source={require('../assets/cal.png')}
                        style={styles.noveltyAttributeIcon}
                      />
                      <Text style={styles.noveltyAttributeText}>
                        {item.anneeFabrication}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.noveltyFooter}>
                    <Text style={styles.noveltyPrice}>
                      ${item.prixParJ}/ day
                    </Text>
                    <TouchableOpacity
                      style={{
                        borderRadius: SPACING / 2,
                        overflow: 'hidden',
                      }}
                      onPress={() =>
                        navigation.navigate('Info', {id: item._id})
                      }>
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
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
        <View style={styles.brandSection}>
          <Text style={styles.brandTitle}>Premium Brands</Text>
          <FlatList
            data={brands}
            renderItem={renderBrandItem}
            keyExtractor={item => item.name}
            horizontal
            contentContainerStyle={styles.brandList}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

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
    marginBottom: 20,
  },
  brandList: {
    paddingBottom: 20,
    marginBottom: 20,
  },
  brandCard: {
    width: 100,
    alignItems: 'center',
    marginRight: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
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
  noveltyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: SPACING * 2,
    padding: 0,
    marginRight: SPACING * 2,
    width: width / 1.5 - SPACING * 2, // Reduced width
    //height: 340, // Set height to 300
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.12,
    shadowRadius: 10,
    overflow: 'hidden',
    marginBottom: SPACING * 2,
    transform: [{scale: 1}],
  },
  noveltyTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },

  noveltyTitle: {
    color: colors.black,
    fontSize: SPACING * 2.5,
    fontWeight: '600',
    marginBottom: 20,
  },
  noveltyCardImageWrapper: {
    position: 'relative',
  },
  noveltyImage: {
    width: '100%',
    height: 140, // Reduced image height
    borderTopLeftRadius: SPACING * 2,
    borderTopRightRadius: SPACING * 2,
  },
  noveltyBadge: {
    position: 'absolute',
    top: SPACING,
    left: SPACING,
    backgroundColor: '#1ECB15',
    borderRadius: 15,
    paddingVertical: SPACING / 3,
    paddingHorizontal: SPACING * 1.5,
  },
  noveltyBadgeText: {
    color: '#FFF',
    fontSize: SPACING * 1.35,
    fontWeight: '600',
  },
  noveltyFavouriteButton: {
    position: 'absolute',
    top: SPACING / 1.5,
    right: SPACING / 1.5,
  },
  noveltyInfo: {
    padding: SPACING * 1.5,
  },
  noveltyCarName: {
    fontSize: SPACING * 2, // Slightly reduced font size
    fontWeight: '700',
    marginBottom: SPACING / 2,
    color: '#000',
  },
  noveltyCarCategory: {
    fontSize: SPACING * 1.4, // Slightly reduced font size
    marginBottom: SPACING,
    color: '#000',
  },
  noveltyAttributes: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Ensure items are spaced out evenly
    flexWrap: 'wrap',
    marginBottom: SPACING,
    width: '100%',
  },
  noveltyAttributes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING,
    justifyContent: 'space-between', // Ensure space between rows
  },
  noveltyAttribute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING / 2,
    width: '48%', // Adjust width to ensure two columns
  },
  noveltyAttributeIcon: {
    width: SPACING * 1.8, // Reduced icon size
    height: SPACING * 1.8, // Reduced icon size
    marginRight: SPACING / 2,
    alignSelf: 'center',
  },
  noveltyAttributeText: {
    fontSize: SPACING * 1.4, // Reduced text size
    alignSelf: 'center',
  },

  noveltyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E9E9E9',
    paddingTop: SPACING,
    marginTop: SPACING,
  },
  noveltyPrice: {
    fontSize: SPACING * 2, // Slightly reduced font size
    fontWeight: 'bold',
    color: '#000',
  },
  noveltyDetailsText: {
    color: '#1ECB15',
    fontSize: SPACING * 1.8, // Slightly reduced font size
    fontWeight: '600',
    marginRight: SPACING / 2,
  },
  noveltyDetailsLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  noveltyDetailsIcon: {
    marginLeft: SPACING / 2,
  },
  iconBackground: {
    backgroundColor: '#FFF',
    borderRadius: SPACING * 2,
    padding: SPACING / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
