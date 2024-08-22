import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from 'react-native-dotenv';
import Config from 'react-native-config'; 

const PaymentScreen = () => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [error, setError] = useState('');
  const [reservation, setReservation] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const reservationId = await AsyncStorage.getItem('reservationId'); 
        const token = await AsyncStorage.getItem('token'); 

        if (!reservationId) {
          setError('Reservation ID is missing');
          return;
        }

        if (!token) {
          setError('Authentication token is missing');
          return;
        }

        const response = await axios.get(`${Config.API_URL}/reservations/${reservationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          setReservation(response.data);
        } else {
          setError('Failed to fetch reservation details');
        }
      } catch (error) {
        console.error('Error fetching reservation:', error);
        setError('Failed to fetch reservation details');
      }
    };

    fetchReservation();
  }, []);

  const handlePayment = async () => {
    try {
      const reservationId = await AsyncStorage.getItem('reservationId');
      const token = await AsyncStorage.getItem('token');

      if (!reservationId || !token) {
        setError('Missing reservation ID or authentication token');
        return;
      }

      if (paymentMethod === 'card') {
        Alert.alert('Error', 'The procedures for card payments are not yet completed.');
        return;
      }

      const response = await axios.post(
        `${Config.API_URL}/payments`,
        {
          idReservation: reservationId,
          methodePaiement: paymentMethod,
          status: 'payee',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 201) {
        Alert.alert('Success', 'Payment successful, awaiting admin confirmation.');
        navigation.navigate('Orders');
      } else {
        setError('Payment failed with status code: ' + response.status);
      }
    } catch (error) {
      if (error.response) {
        setError(`Payment failed with status code: ${error.response.status}. Message: ${error.response.data?.message || 'No additional message'}`);
      } else if (error.request) {
        setError('No response received from the server. Please try again later.');
      } else {
        setError('An unexpected error occurred: ' + error.message);
      }
      console.error('Error making payment:', error);
    }
  };

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {reservation ? (
        <>
          <Text style={styles.label}>Total Amount: ${reservation.tarifTotale}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.paymentButton,
                paymentMethod === 'cash' && styles.selectedButton,
              ]}
              onPress={() => setPaymentMethod('cash')}>
              <Text style={styles.buttonText}>Pay by Cash</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentButton,
                paymentMethod === 'card' && styles.selectedButton,
              ]}
              onPress={() => setPaymentMethod('card')}>
              <Text style={styles.buttonText}>Pay by Card</Text>
            </TouchableOpacity>
          </View>

          <Button title="Make Payment" onPress={handlePayment} />
        </>
      ) : (
        <Text style={styles.loadingText}>Loading reservation details...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  paymentButton: {
    padding: 15,
    backgroundColor: '#007bff',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#0056b3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default PaymentScreen;
