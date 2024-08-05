import React, {useState, useEffect} from 'react';
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const HomeScreen = () => {
  const [cars, setCars] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12); // Number of items per page
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCars();
  }, [page]);

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

  const renderItem = ({item}) => (
    <View style={styles.card}>
      <View style={styles.leftSection}>
        <Text style={styles.title}>
          {item.marque} {item.modele} {item.anneeFabrication}
        </Text>
        <Image
          source={{uri: item.image}}
          style={styles.image}
          onError={() => console.log('Failed to load image:', item.image)}
        />
      </View>
      <View style={styles.verticalLine} />
      <View style={styles.rightSection}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons
            name="car-shift-pattern"
            size={20}
            color="#000"
          />
          <Text style={styles.details}>{item.typeTransmission}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="car-door" size={20} color="#000" />
          <Text style={styles.details}>{item.NbPortes} Doors</Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="speedometer-outline" size={20} color="#000" />
          <Text style={styles.details}>{item.kilometrage} km</Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="snow-outline" size={20} color="#000" />
          <Text style={styles.details}>
            {item.climatisation ? 'A/C' : 'No A/C'}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="cash-outline" size={20} color="#000" />
          <Text style={styles.details}>${item.prixParJ} /day</Text>
        </View>
      </View>
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Car Listings</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
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
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  leftSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    paddingLeft: 10,
  },
  verticalLine: {
    width: 1,
    height: '100%',
    backgroundColor: '#ccc',
  },
  image: {
    width: 150,
    height: 100,
    borderRadius: 10,
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  details: {
    fontSize: 16,
    color: '#666',
    marginLeft: 5,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  pageButton: {
    padding: 10,
    backgroundColor: '#1ECB15',
    borderRadius: 20,
    marginHorizontal: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  pageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pageInfo: {
    fontSize: 16,
  },
  disabledText: {
    color: '#aaa',
  },
});

export default HomeScreen;
