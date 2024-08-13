import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {RadioButton} from 'react-native-paper'; // Importing RadioButton component from react-native-paper

const OrdersScreen = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('confirmer');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigation = useNavigation();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('token');

        const response = await axios.get(
          `http://192.168.1.185:3001/reservations/client/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

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

  const formatDate = dateString => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}-${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${date.getFullYear()}`;
  };

  const renderOrderStatus = status => {
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

    return (
      <Text style={[styles.statusText, statusStyles[statusMap[status]]]}>
        {statusMap[status]}
      </Text>
    );
  };

  const renderOrders = () => {
    const now = new Date();
    const filteredReservations = reservations.filter(reservation => {
      if (selectedStatus === 'past') {
        return new Date(reservation.dateDebut) < now;
      } else {
        return (
          reservation.status === selectedStatus &&
          new Date(reservation.dateDebut) >= now
        );
      }
    });

    const paginatedReservations = filteredReservations.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );

    if (paginatedReservations.length === 0) {
      return (
        <Text style={styles.noReservationsText}>
          No orders in this category.
        </Text>
      );
    }

    return paginatedReservations.map(reservation => (
      <View key={reservation._id} style={styles.orderContainer}>
        <Text style={styles.orderText}>
          {reservation.idVoiture
            ? `${reservation.idVoiture.marque} ${reservation.idVoiture.modele}`
            : 'Car details not available'}
        </Text>
        <Text style={styles.orderText}>
          {formatDate(reservation.dateDebut)} -{' '}
          {formatDate(reservation.dateFin)}
        </Text>
        <Text style={styles.orderText}>
          {reservation.lieuRamassage} to {reservation.destination}
        </Text>
        <Text style={styles.orderText}>Total: ${reservation.tarifTotale}</Text>
        <Text style={styles.orderText}>
          Driver: {reservation.chauffeur ? 'Yes' : 'No'}
        </Text>
        <Text style={styles.orderText}>
          Comments: {reservation.commentaire}
        </Text>
        {renderOrderStatus(reservation.status)}
      </View>
    ));
  };

  const handlePagination = direction => {
    if (direction === 'next') {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
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
  const getTotalPages = () => {
    const filteredReservations = reservations.filter(reservation => {
      if (selectedStatus === 'past') {
        return new Date(reservation.dateDebut) < new Date();
      } else {
        return (
          reservation.status === selectedStatus &&
          new Date(reservation.dateDebut) >= new Date()
        );
      }
    });
    return Math.ceil(filteredReservations.length / itemsPerPage);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.radioButtonsContainer}>
        <RadioButton.Group
          onValueChange={value => {
            setSelectedStatus(value);
            setCurrentPage(1);
          }}
          value={selectedStatus}>
          <View style={styles.radioButton}>
            <RadioButton value="confirmer" color="#00B74A" />
            <Text style={styles.radioButtonText}>Confirmed Reservation</Text>
          </View>
          <View style={styles.radioButton}>
            <RadioButton value="annuler" color="#F93154" />
            <Text style={styles.radioButtonText}>Cancelled Reservation</Text>
          </View>
          <View style={styles.radioButton}>
            <RadioButton value="en Attent" color="#FFA900" />
            <Text style={styles.radioButtonText}>Scheduled Reservation</Text>
          </View>
          <View style={styles.radioButton}>
            <RadioButton value="past" color="#007bff" />
            <Text style={styles.radioButtonText}>Past Reservation</Text>
          </View>
        </RadioButton.Group>
      </View>
      {renderOrders()}
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[
            styles.paginationButton,
            currentPage === 1 && styles.disabledButton,
          ]}
          onPress={() => handlePagination('prev')}
          disabled={currentPage === 1}>
          <Text style={styles.paginationButtonText}>Previous</Text>
        </TouchableOpacity>

        {/* Add Page Number Display */}
        <Text style={styles.pageNumberText}>
          Page {currentPage} of {getTotalPages()}
        </Text>

        <TouchableOpacity
          style={[
            styles.paginationButton,
            getTotalPages() <= currentPage && styles.disabledButton,
          ]}
          onPress={() => handlePagination('next')}
          disabled={getTotalPages() <= currentPage}>
          <Text style={styles.paginationButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonsContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#ffffff', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioButtonText: {
    fontSize: 17,
    color: '#333', 
    marginLeft: 8,
  },
  orderContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  orderText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#000',
    lineHeight: 24,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 5,
    borderRadius: 15,
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
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  paginationButton: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  paginationButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  pageNumberText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginHorizontal: 10,
    marginTop:10,
  },
  
});

export default OrdersScreen;
