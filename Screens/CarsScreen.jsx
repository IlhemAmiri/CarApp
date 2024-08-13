import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FilterDrawer from '../FilterDrawer';

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
  const [vehicleType, setVehicleType] = useState([]);
  const [bodyType, setBodyType] = useState([]);
  const [seats, setSeats] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [isDrawerVisible, setDrawerVisible] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    fetchCars();
  }, [vehicleType, bodyType, seats, priceRange, page]);

  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, []),
  );
  const CheckBoxRow = ({children}) => (
    <View style={styles.checkboxRow}>{children}</View>
  );

  const CheckBox = ({label, value, onChange}) => (
    <TouchableOpacity onPress={onChange} style={styles.checkboxContainer}>
      <View style={[styles.checkbox, value && styles.checkboxChecked]}>
        {value && <Ionicons name="checkmark" size={14} color={colors.white} />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const fetchCars = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://192.168.1.185:3001/cars/recherche/check`,
        {
          params: {
            page,
            limit,
            vehicleType: vehicleType.join(','),
            bodyType: bodyType.join(','),
            seats: seats.join(','),
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
          },
        },
      );
      setCars(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching cars:', error);
    }
    setLoading(false);
  };

  const toggleVehicleType = type => {
    setVehicleType(prev => (prev.includes(type) ? [] : [type]));
  };

  const toggleBodyType = type => {
    setBodyType(prev => (prev.includes(type) ? [] : [type]));
  };

  const toggleSeats = seatCount => {
    setSeats(prev => (prev.includes(seatCount) ? [] : [seatCount]));
  };

  const setPrice = (min, max) => {
    setPriceRange([min, max]);
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
        {item.note > 0 ? (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" color={colors.yellow} size={SPACING * 1.6} />
            <Text style={styles.ratingText}>{item.note}</Text>
          </View>
        ) : (
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons
              name="star-off-outline"
              color={colors.yellow}
              size={SPACING * 2}
            />
          </View>
        )}

        <TouchableOpacity onPress={() => toggleFavourite(item._id)}>
          <Ionicons
            name={favourites.has(item._id) ? 'heart' : 'heart-outline'}
            color={favourites.has(item._id) ? 'red' : 'red'}
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
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons
            name="car-shift-pattern"
            size={20}
            color={colors.black}
          />
          <Text style={styles.details}>{item.typeTransmission}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons
            name="car-door"
            size={20}
            color={colors.black}
          />
          <Text style={styles.details}>{item.NbPortes} Doors</Text>
        </View>
      </View>
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Icon name="speedometer-outline" size={20} color={colors.black} />
          <Text style={styles.details}>{item.kilometrage} km</Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="snow-outline" size={20} color={colors.black} />
          <Text style={styles.details}>
            {item.climatisation ? 'A/C' : 'No A/C'}
          </Text>
        </View>
      </View>
      <View style={styles.detailItem}>
        <Icon name="cash-outline" size={20} color={colors.black} />
        <Text style={styles.details}>${item.prixParJ} /day</Text>
      </View>
      <TouchableOpacity
        style={styles.infoButton}
        onPress={() => navigation.navigate('Info', {id: item._id})}>
        <LinearGradient
          style={styles.infoButtonGradient}
          colors={[colors.black, '#616161']}>
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
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setDrawerVisible(true)}
      >
         <Icon name="filter-outline" size={20} color={colors.white} />
        <Text style={styles.filterButtonText}> Filter</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color={colors.green} />
      ) : (
        <FlatList
          data={cars}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          showsVerticalScrollIndicator={false}
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
      {/* The Filter Drawer Modal */}
      <Modal
        visible={isDrawerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDrawerVisible(false)}
      >
        <FilterDrawer
          vehicleType={vehicleType}
          bodyType={bodyType}
          seats={seats}
          toggleVehicleType={toggleVehicleType}
          toggleBodyType={toggleBodyType}
          toggleSeats={toggleSeats}
          onClose={() => setDrawerVisible(false)}
        />
      </Modal>
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
    backgroundColor: '#f5f5f5',
    borderRadius: SPACING * 2,
    padding: SPACING * 2,
    marginVertical: SPACING,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING * 1.5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: colors['dark-gray'],
    marginLeft: SPACING / 2,
    fontWeight: 'bold',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: SPACING * 2,
    marginBottom: SPACING * 1.5,
    backgroundColor: '#e0e0e0', // Fallback color while loading image
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING * 1.5,
    color: colors.black,
  },
  detailsContainer: {
    marginBottom: SPACING,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING / 2,
  },
  details: {
    fontSize: 14,
    color: colors['dark-gray'],
    marginLeft: SPACING / 2,
  },
  infoButton: {
    borderRadius: SPACING * 1.5,
    overflow: 'hidden',
    alignSelf: 'center',
    marginTop: SPACING * 2,
  },
  infoButtonGradient: {
    paddingVertical: SPACING / 3,
    paddingHorizontal: SPACING * 3,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING * 2.5,
  },
  pageButton: {
    padding: SPACING * 1.2,
    backgroundColor: colors.black,
    borderRadius: SPACING,
    marginHorizontal: SPACING,
  },
  disabledButton: {
    backgroundColor: '#bdbdbd',
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
  filterButton: {
    padding: 10,
    backgroundColor: colors.black,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default CarsScreen;
