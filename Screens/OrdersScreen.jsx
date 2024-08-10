import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const OrdersScreen = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPastReservations, setShowPastReservations] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('token');

        const response = await axios.get(`http://192.168.1.185:3001/reservations/client/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setReservations(response.data);
      } catch (error) {
        console.error('Error fetching reservations:', error);
        setError('Failed to fetch reservations');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date.getFullYear()}`;
  };

  const renderOrderStatus = (status) => {
    const statusMap = {
      confirmer: 'Completed',
      annuler: 'Cancelled',
      'en Attent': 'Scheduled',
    };

    const statusStyles = {
      Completed: styles.statusCompleted,
      Cancelled: styles.statusCancelled,
      Scheduled: styles.statusScheduled,
    };

    return <Text style={[styles.statusText, statusStyles[statusMap[status]]]}>{statusMap[status]}</Text>;
  };

  const renderOrders = (status) => {
    const now = new Date();
    const filteredReservations = reservations.filter(
      (reservation) => reservation.status === status && new Date(reservation.dateDebut) >= now
    );

    if (filteredReservations.length === 0) {
      return <Text style={styles.noReservationsText}>No orders in this category.</Text>;
    }

    return filteredReservations.map((reservation) => (
      <View key={reservation._id} style={styles.orderContainer}>
        <Text style={styles.orderText}>{reservation.idVoiture ? `${reservation.idVoiture.marque} ${reservation.idVoiture.modele}` : 'Car details not available'}</Text>
        <Text style={styles.orderText}>{formatDate(reservation.dateDebut)} - {formatDate(reservation.dateFin)}</Text>
        <Text style={styles.orderText}>{reservation.lieuRamassage} to {reservation.destination}</Text>
        <Text style={styles.orderText}>Total: ${reservation.tarifTotale}</Text>
        <Text style={styles.orderText}>Driver: {reservation.chauffeur ? 'Yes' : 'No'}</Text>
        <Text style={styles.orderText}>Comments: {reservation.commentaire}</Text>
        {renderOrderStatus(reservation.status)}
      </View>
    ));
  };

  const renderPastOrders = () => {
    const now = new Date();
    const pastReservations = reservations.filter((reservation) => new Date(reservation.dateDebut) < now);

    if (pastReservations.length === 0) {
      return <Text style={styles.noReservationsText}>No past reservations.</Text>;
    }

    return pastReservations.map((reservation) => (
      <View key={reservation._id} style={styles.orderContainer}>
        <Text style={styles.orderText}>{reservation.idVoiture ? `${reservation.idVoiture.marque} ${reservation.idVoiture.modele}` : 'Car details not available'}</Text>
        <Text style={styles.orderText}>{formatDate(reservation.dateDebut)} - {formatDate(reservation.dateFin)}</Text>
        <Text style={styles.orderText}>{reservation.lieuRamassage} to {reservation.destination}</Text>
        <Text style={styles.orderText}>Total: ${reservation.tarifTotale}</Text>
        <Text style={styles.orderText}>Driver: {reservation.chauffeur ? 'Yes' : 'No'}</Text>
        <Text style={styles.orderText}>Comments: {reservation.commentaire}</Text>
        {renderOrderStatus(reservation.status)}
      </View>
    ));
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    Alert.alert('Error', error);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Text style={styles.sectionTitle}>Scheduled Orders</Text>
        {renderOrders('en Attent')}
      </View>
      <View>
        <Text style={styles.sectionTitle}>Completed Orders</Text>
        {renderOrders('confirmer')}
      </View>
      <View>
        <Text style={styles.sectionTitle}>Cancelled Orders</Text>
        {renderOrders('annuler')}
      </View>
      <TouchableOpacity style={styles.pastOrdersButton} onPress={() => setShowPastReservations(!showPastReservations)}>
        <Text style={styles.pastOrdersButtonText}>{showPastReservations ? 'Hide' : 'Show'} Past Reservations</Text>
      </TouchableOpacity>
      {showPastReservations && (
        <View>
          <Text style={styles.sectionTitle}>Past Reservations</Text>
          {renderPastOrders()}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  orderContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  orderText: {
    fontSize: 16,
    marginBottom: 5,
    color:'#000'
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 5,
    borderRadius: 4,
  },
  statusCompleted: {
    backgroundColor: '#00B74A',
    color: '#fff',
  },
  statusCancelled: {
    backgroundColor: '#F93154',
    color: '#fff',
  },
  statusScheduled: {
    backgroundColor: '#FFA900',
    color: '#fff',
  },
  noReservationsText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  pastOrdersButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  pastOrdersButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default OrdersScreen;
