import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_URL } from 'react-native-dotenv';
import Config from 'react-native-config'; 

const {width} = Dimensions.get('window');

const FavCarScreen = ({navigation}) => {
  const [client, setClient] = useState(null);
  const [cars, setCars] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('token');
  
        if (!userId || !token) {
          navigation.navigate('Signin');
          return;
        }
  
        const [clientResponse, favoriteCarsResponse] = await Promise.all([
          axios.get(`${Config.API_URL}/users/clients/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(`${Config.API_URL}/favorite-cars/client/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);
  
        // Remplacer l'URL de l'image du client
        const clientData = clientResponse.data;
        if (clientData.image && clientData.image.includes("http://localhost:3001")) {
          clientData.image = clientData.image.replace("http://localhost:3001", "http://10.0.2.2:3001");
        }
        setClient(clientData);
  
        const favoriteCars = favoriteCarsResponse.data;
  
        // Remplacer l'URL de l'image pour chaque voiture favorite
        const carDetailsPromises = favoriteCars.map(async favCar => {
          const carResponse = await axios.get(`${Config.API_URL}/cars/${favCar.idVoiture}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          const carData = carResponse.data;
          if (carData.image && carData.image.includes("http://localhost:3001")) {
            carData.image = carData.image.replace("http://localhost:3001", "http://10.0.2.2:3001");
          }
          return carData;
        });
  
        const carDetailsResponses = await Promise.all(carDetailsPromises);
        setCars(carDetailsResponses);
      } catch (error) {
        setError('Failed to fetch data');
      }
    };
  
    fetchClientData();
  }, []);  
  const handleRemoveFavorite = async carId => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('token');

      await axios.delete(`${Config.API_URL}/favorite-cars`, {
        data: {idClient: userId, idVoiture: carId},
        headers: {Authorization: `Bearer ${token}`},
      });

      setCars(cars.filter(car => car._id !== carId));
    } catch (error) {
      setError('Failed to remove favorite car');
    }
  };

  const renderItem = ({item}) => (
    <View style={styles.carCard}>
      <Image source={{uri: item.image}} style={styles.carImage} />
      <View style={styles.carDetailsContainer}>
        <Text style={styles.carModel}>{item.modele}</Text>
        <Text style={styles.carDetails}>
          {item.marque} - {item.anneeFabrication}
        </Text>
        <Text style={styles.carPrice}>${item.prixParJ} / day</Text>
        <TouchableOpacity
          onPress={() => handleRemoveFavorite(item._id)}
          style={styles.removeButton}>
          <Ionicons name="heart-dislike-outline" size={24} color="#FF6B6B" />
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!client) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={{
            uri:
              client.image || 'https://your-default-image-url.com/avatar.png',
          }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>
          {client.nom} {client.prenom}
        </Text>
        <Text style={styles.profileEmail}>{client.email}</Text>
      </View>
      <FlatList
        data={cars}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.carsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 60,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#000',
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  profileEmail: {
    fontSize: 14,
    color: '#777',
  },
  carsList: {
    paddingBottom: 16,
  },
  carCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
  },
  carImage: {
    width: width * 0.4,
    height: 100,
    borderRadius: 8,
  },
  carDetailsContainer: {
    flex: 1,
    paddingLeft: 16,
  },
  carModel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  carDetails: {
    fontSize: 14,
    color: '#777',
    marginBottom: 8,
  },
  carPrice: {
    fontSize: 16,
    color: '#1ECB15',
    fontWeight: '600',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  removeButtonText: {
    marginLeft: 8,
    color: '#FF6B6B',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FavCarScreen;
