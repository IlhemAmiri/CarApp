import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SPACING = 10;
const colors = {
  light: '#f8f8f8',
  'dark-gray': '#333333',
  black: '#000000',
  yellow: '#FFD700',
  green: '#1ECB15',
  white: '#ffffff',
  gray: '#666666',
};

const CarsScreen = () => {
  const [cars, setCars] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12); // Number of items per page
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [favourites, setFavourites] = useState(new Set());

  const navigation = useNavigation();

  useEffect(() => {
    fetchCars();
  }, [page]);

  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [])
  );

  const fetchCars = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://192.168.1.185:3001/cars?page=${page}&limit=${limit}`,
      );
      setCars(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching cars:', error);
    }
    setLoading(false);
  };

  const fetchFavourites = async (userId, token) => {
    try {
      const response = await axios.get(
        `http://192.168.1.185:3001/favorite-cars/client/${userId}`,
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

  const toggleFavourite = async carId => {
    const isFavourite = favourites.has(carId);
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');

      if (!isFavourite) {
        // Add favorite
        await axios.post(
          'http://192.168.1.185:3001/favorite-cars',
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
        await axios.delete('http://192.168.1.185:3001/favorite-cars', {
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

  const renderItem = ({item}) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" color={colors.yellow} size={SPACING * 1.6} />
          <Text style={styles.ratingText}>{item.note}</Text>
        </View>
        <TouchableOpacity onPress={() => toggleFavourite(item._id)}>
          <Ionicons
            name={favourites.has(item._id) ? 'heart' : 'heart-outline'}
            color="#000"
            size={SPACING * 2}
          />
        </TouchableOpacity>
      </View>
      <Image
        source={{uri: item.image}}
        style={styles.image}
        onError={() => console.log('Failed to load image:', item.image)}
      />
      <Text style={styles.title}>
        {item.marque} {item.modele} {item.anneeFabrication}
      </Text>
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons
            name="car-shift-pattern"
            size={20}
            color={colors.gray}
          />
          <Text style={styles.details}>{item.typeTransmission}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons
            name="car-door"
            size={20}
            color={colors.gray}
          />
          <Text style={styles.details}>{item.NbPortes} Doors</Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="speedometer-outline" size={20} color={colors.gray} />
          <Text style={styles.details}>{item.kilometrage} km</Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="snow-outline" size={20} color={colors.gray} />
          <Text style={styles.details}>
            {item.climatisation ? 'A/C' : 'No A/C'}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="cash-outline" size={20} color={colors.gray} />
          <Text style={styles.details}>${item.prixParJ} /day</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.infoButton}
        onPress={() => navigation.navigate('Info', {id: item._id})}>
        <LinearGradient
          style={styles.infoButtonGradient}
          colors={[colors.green, colors['dark-gray']]}>
          <Ionicons
            name="arrow-forward"
            size={SPACING * 2}
            color={colors.light}
          />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const handleNextPage = () => {
    if (page * limit < total) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(prevPage => prevPage - 1);
    }
  };

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      await fetchFavourites(userId, token);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.green} />
      ) : (
        <FlatList
          data={cars}
          renderItem={renderItem}
          keyExtractor={item => item._id}
        />
      )}
      <View style={styles.pagination}>
        <TouchableOpacity
          onPress={handlePreviousPage}
          disabled={page === 1}
          style={[styles.pageButton, page === 1 && styles.disabledButton]}>
          <Text
            style={[styles.pageButtonText, page === 1 && styles.disabledText]}>
            Previous
          </Text>
        </TouchableOpacity>
        <Text style={styles.pageInfo}>Page {page}</Text>
        <TouchableOpacity
          onPress={handleNextPage}
          disabled={page * limit >= total}
          style={[
            styles.pageButton,
            page * limit >= total && styles.disabledButton,
          ]}>
          <Text
            style={[
              styles.pageButtonText,
              page * limit >= total && styles.disabledText,
            ]}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING * 2,
    backgroundColor: colors.light,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: SPACING,
    padding: SPACING * 1.5,
    marginVertical: SPACING,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: colors.black,
    marginLeft: SPACING / 2,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: SPACING,
    marginBottom: SPACING,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING,
    color: colors['dark-gray'],
  },
  detailsContainer: {
    marginBottom: SPACING,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING / 2,
  },
  details: {
    fontSize: 16,
    color: colors.gray,
    marginLeft: SPACING / 2,
  },
  infoButton: {
    borderRadius: SPACING,
    overflow: 'hidden',
    alignSelf: 'center',
    marginTop: SPACING,
  },
  infoButtonGradient: {
    paddingVertical: SPACING / 3,
    paddingHorizontal: SPACING * 2,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING * 2,
  },
  pageButton: {
    padding: SPACING,
    backgroundColor: colors.green,
    borderRadius: SPACING,
    marginHorizontal: SPACING,
  },
  disabledButton: {
    backgroundColor: colors.gray,
  },
  pageButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  pageInfo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors['dark-gray'],
  },
  disabledText: {
    color: colors.light,
  },
});

export default CarsScreen;
