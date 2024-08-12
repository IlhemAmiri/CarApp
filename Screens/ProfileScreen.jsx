import React, {useEffect, useState} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

function ProfileScreen({navigation}) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');
        const response = await fetch(
          `http://192.168.1.185:3001/users/clients/${userId}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

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
  }, [])
);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1ECB15" />
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
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={{uri: userData.image || 'https://via.placeholder.com/100'}}
          style={styles.profileImage}
        />
        <Text
          style={
            styles.profileName
          }>{`${userData.prenom} ${userData.nom}`}</Text>
        <Text style={styles.profileEmail}>{userData.email}</Text>
      </View>

      <View style={styles.profileDetails}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.detailRow}>
          <Icon
            name="badge"
            size={24}
            color="#004800"
            style={styles.detailIcon}
          />
          <Text style={styles.detailText}>CIN: {userData.CIN}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon
            name="fingerprint"
            size={24}
            color="#004800"
            style={styles.detailIcon}
          />
          <Text style={styles.detailText}>Passport: {userData.passport}</Text>
        </View>

        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.detailRow}>
          <Icon
            name="home"
            size={24}
            color="#004800"
            style={styles.detailIcon}
          />
          <Text style={styles.detailText}>Address: {userData.adresse}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon
            name="phone"
            size={24}
            color="#004800"
            style={styles.detailIcon}
          />
          <Text style={styles.detailText}>Phone: {userData.numTel}</Text>
        </View>

        <Text style={styles.sectionTitle}>Driving License</Text>
        <View style={styles.detailRow}>
          <Icon
            name="directions-car"
            size={24}
            color="#004800"
            style={styles.detailIcon}
          />
          <Text style={styles.detailText}>
            License: {userData.numPermisConduire}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon
            name="event-busy"
            size={24}
            color="#004800"
            style={styles.detailIcon}
          />
          <Text style={styles.detailText}>
            Expiry:{' '}
            {new Date(userData.dateExpirationPermis).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon
            name="calendar-today"
            size={24}
            color="#004800"
            style={styles.detailIcon}
          />
          <Text style={styles.detailText}>
            DOB: {new Date(userData.dateNaissance).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate('UpdateProfile', {id: userData._id})
          }>
          <LinearGradient
            style={styles.gradient}
            colors={['#1ECB15','#006200']}>
            <Text style={styles.textupdate}> Update Your Profile </Text>
            <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  textupdate: {
    fontSize: 16,
    color: '#FFFFFF',
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
    borderWidth: 3,
    borderColor: '#1ECB15',
  },
  profileName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E2126',
  },
  profileEmail: {
    fontSize: 16,
    color: '#777',
  },
  profileDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E2126',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  detailIcon: {
    marginRight: 15,
  },
  detailText: {
    fontSize: 18,
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
  button: {
    marginTop: 15,
    alignSelf: 'center',
  },
  gradient: {
    paddingVertical: 5,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});

export default ProfileScreen;
