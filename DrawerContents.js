import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Avatar, Title } from 'react-native-paper';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DrawerList = [
  { icon: 'home-outline', label: 'Home', navigateTo: 'Home' },
  { icon: 'car-multiple', label: 'cars', navigateTo: 'Cars' },
  { icon: 'account-outline', label: 'Profile', navigateTo: 'Profile' },
  { icon: 'cart-outline', label: 'Orders', navigateTo: 'Orders' },
  { icon: 'heart-outline', label: 'Favorite', navigateTo: 'FavCar' },
];

const DrawerLayout = ({ icon, label, navigateTo }) => {
  const navigation = useNavigation();
  return (
    <DrawerItem
      icon={({ color, size }) => <Icon name={icon} color={color} size={size} />}
      label={label}
      onPress={() => {
        navigation.navigate(navigateTo);
      }}
    />
  );
};

const DrawerItems = () => {
  return DrawerList.map((el, i) => (
    <DrawerLayout
      key={i}
      icon={el.icon}
      label={el.label}
      navigateTo={el.navigateTo}
    />
  ));
};

function DrawerContent({ setIsLoggedIn, ...props }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

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

  const handleSignOut = async () => {
    try {
      await AsyncStorage.clear();
      setIsLoggedIn(false);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1ECB15" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          <TouchableOpacity activeOpacity={0.8}>
            <View style={styles.userInfoSection}>
              <View style={{ flexDirection: 'row', marginTop: 15 }}>
                <Avatar.Image
                  source={{ uri: userData?.image || 'https://via.placeholder.com/50' }}
                  size={50}
                  style={{ marginTop: 5 }}
                />
                <View style={{ marginLeft: 10, flexDirection: 'column' }}>
                  <Title style={styles.title}>{userData?.prenom} {userData?.nom}</Title>
                  <Text style={styles.caption} numberOfLines={1}>
                    {userData?.email}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.drawerSection}>
            <DrawerItems />
          </View>
        </View>
      </DrawerContentScrollView>
      <View>
        <DrawerItem
          icon={({ color, size }) => <Icon name="exit-to-app" color={color} size={size} />}
          label="Sign Out"
          onPress={handleSignOut}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
  },
  title: {
    fontSize: 16,
    marginTop: 3,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
  },
  drawerSection: {
    marginTop: 15,
    borderTopColor: '#f4f4f4',
    borderTopWidth: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DrawerContent;
