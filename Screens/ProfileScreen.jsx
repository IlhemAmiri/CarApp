import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

function ProfileScreen(props) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');
        const response = await fetch(`http://192.168.1.185:3001/users/clients/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading user data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image source={{ uri: userData.image || 'https://via.placeholder.com/100' }} style={styles.profileImage} />
        <Text style={styles.profileName}>{`${userData.prenom} ${userData.nom}`}</Text>
        <Text style={styles.profileEmail}>{userData.email}</Text>
      </View>

      <View style={styles.profileDetails}>
        <View style={styles.detailRow}>
          <Icon name="badge" size={24} color="#000" style={styles.detailIcon} />
          <Text style={styles.detailText}>CIN: {userData.CIN}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="fingerprint" size={24} color="#000" style={styles.detailIcon} />
          <Text style={styles.detailText}>Passport: {userData.passport}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="home" size={24} color="#000" style={styles.detailIcon} />
          <Text style={styles.detailText}>Address: {userData.adresse}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="phone" size={24} color="#000" style={styles.detailIcon} />
          <Text style={styles.detailText}>Phone: {userData.numTel}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="calendar-today" size={24} color="#000" style={styles.detailIcon} />
          <Text style={styles.detailText}>Date of Birth: {new Date(userData.dateNaissance).toLocaleDateString()}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="directions-car" size={24} color="#000" style={styles.detailIcon} />
          <Text style={styles.detailText}>Driving License: {userData.numPermisConduire}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="event-busy" size={24} color="#000" style={styles.detailIcon} />
          <Text style={styles.detailText}>License Expiry: {new Date(userData.dateExpirationPermis).toLocaleDateString()}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileEmail: {
    fontSize: 16,
    color: '#777',
  },
  profileDetails: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailIcon: {
    marginRight: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});

export default ProfileScreen;
