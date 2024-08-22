import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useRoute} from '@react-navigation/native';
import { API_URL } from 'react-native-dotenv';
import Config from 'react-native-config'; 

const BookingScreen = () => {
  const [car, setCar] = useState(null);
  const [client, setClient] = useState(null);
  const [formData, setFormData] = useState({
    dateDebut: new Date(),
    dateFin: new Date(),
    chauffeur: false,
    commentaire: '',
    lieuRamassage: '',
    destination: '',
  });
  const [errors, setErrors] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState({
    dateDebut: false,
    dateFin: false,
  });

  const navigation = useNavigation();
  const route = useRoute();
  const backIcon = require('../assets/left-arrow.png');
  const {id} = route.params;

  useEffect(() => {
    const fetchClientAndCarData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('token');

        const clientResponse = await axios.get(
          `${Config.API_URL}/users/clients/${userId}`,
          {
            headers: {Authorization: `Bearer ${token}`},
          },
        );
        setClient(clientResponse.data);

        const carResponse = await axios.get(
          `${Config.API_URL}/cars/${id}`,
          {
            headers: {Authorization: `Bearer ${token}`},
          },
        );
        if (carResponse.data.image && carResponse.data.image.includes("http://localhost:3001")) {
          carResponse.data.image = carResponse.data.image.replace("http://localhost:3001", "http://10.0.2.2:3001");
        }
        setCar(carResponse.data);
        setFormData(prevFormData => ({
          ...prevFormData,
          idClient: userId,
          idVoiture: id,
        }));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientAndCarData();
  }, [id]);

  useEffect(() => {
    if (car) {
      const dateDebut = new Date(formData.dateDebut);
      const dateFin = new Date(formData.dateFin);
      const period = (dateFin - dateDebut) / (1000 * 60 * 60 * 24); // Convert milliseconds to days
      const price = period * car.prixParJ;
      setTotalPrice(price);
    }
  }, [formData.dateDebut, formData.dateFin, car]);

  const handleDateChange = (event, selectedDate, field) => {
    if (selectedDate) {
      setFormData(prevFormData => ({
        ...prevFormData,
        [field]: selectedDate,
      }));
      setShowDatePicker({...showDatePicker, [field]: false});
    }
  };

  const handleChange = (name, value) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const newErrors = [];
    const now = new Date();
    const dateDebut = new Date(formData.dateDebut);
    const dateFin = new Date(formData.dateFin);

    if (dateDebut >= dateFin) {
      newErrors.push('Start date must be before end date');
    }
    if (dateDebut <= now || dateFin <= now) {
      newErrors.push('Dates must be in the future');
    }

    const requiredFields = [
      'nom',
      'prenom',
      'email',
      'CIN',
      'passport',
      'adresse',
      'numTel',
      'numPermisConduire',
    ];
    if (client) {
      for (const field of requiredFields) {
        if (!client[field] || client[field].trim() === '') {
          newErrors.push(`Client information incomplete: ${field} is required`);
        }
      }

      const dateExpirationPermis = new Date(client.dateExpirationPermis);
      if (dateExpirationPermis < now) {
        newErrors.push("The client's driving license has expired");
      }
    }

    if (newErrors.length === 0) {
      try {
        const token = await AsyncStorage.getItem('token');
        await axios.post(
          `${Config.API_URL}/reservations`,
          {
            ...formData,
            dateDebut: formData.dateDebut.toISOString(),
            dateFin: formData.dateFin.toISOString(),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
        navigation.navigate('Orders');
      } catch (error) {
        console.error(
          'Error creating reservation:',
          error.response.data.message,
        );
        newErrors.push(error.response.data.message);
      }
    }

    setErrors(newErrors);
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <Image source={backIcon} style={styles.icon} />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Booking a Car</Text>
      {car && (
        <View style={styles.carDetails}>
          <Image source={{uri: car.image}} style={styles.carImage} />
          <View>
            <Text style={styles.carTitle}>{`${car.marque} ${car.modele}`}</Text>
            <Text style={styles.carPrice}>Price per day: ${car.prixParJ}</Text>
          </View>
        </View>
      )}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Pick-up Date</Text>
        <TouchableOpacity
          onPress={() =>
            setShowDatePicker({...showDatePicker, dateDebut: true})
          }>
          <Text style={styles.dateText}>
            {formData.dateDebut.toDateString()}
          </Text>
        </TouchableOpacity>
        {showDatePicker.dateDebut && (
          <DateTimePicker
            value={formData.dateDebut}
            mode="date"
            display="calendar"
            onChange={(event, selectedDate) =>
              handleDateChange(event, selectedDate, 'dateDebut')
            }
          />
        )}
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Drop-off Date</Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker({...showDatePicker, dateFin: true})}>
          <Text style={styles.dateText}>{formData.dateFin.toDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker.dateFin && (
          <DateTimePicker
            value={formData.dateFin}
            mode="date"
            display="calendar"
            onChange={(event, selectedDate) =>
              handleDateChange(event, selectedDate, 'dateFin')
            }
          />
        )}
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Pick-up Location</Text>
        <TextInput
          style={styles.input}
          value={formData.lieuRamassage}
          onChangeText={text => handleChange('lieuRamassage', text)}
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Destination</Text>
        <TextInput
          style={styles.input}
          value={formData.destination}
          onChangeText={text => handleChange('destination', text)}
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Comments</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={4}
          value={formData.commentaire}
          onChangeText={text => handleChange('commentaire', text)}
        />
      </View>
      <View style={styles.formGroup}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => handleChange('chauffeur', !formData.chauffeur)}>
          <Text style={styles.checkboxLabel}>
            <Text style={styles.checkbox}>
              {formData.chauffeur ? '✓' : '○'}
            </Text>{' '}
            Need a driver
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.totalPrice}>Total Price: ${totalPrice}</Text>
      </View>
      {errors.length > 0 && (
        <View style={styles.errorContainer}>
          {errors.map((error, index) => (
            <Text key={index} style={styles.errorText}>
              {error}
            </Text>
          ))}
        </View>
      )}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Book Now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  carDetails: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  carImage: {
    width: 100,
    height: 80,
    marginRight: 20,
    borderRadius: 10,
  },
  carTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  carPrice: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dateText: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#333',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  checkbox: {
    marginRight: 10,
    fontSize: 20,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
  },
  icon: {
    width: 25,
    height: 25,
  },
});

export default BookingScreen;
