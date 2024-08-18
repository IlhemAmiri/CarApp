import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Text, ActivityIndicator} from 'react-native';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import {Avatar, Title} from 'react-native-paper';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient'; // Pour le dégradé de couleur

const DrawerList = [
  {icon: 'home', label: 'Home', navigateTo: 'Home', color: '#3a9679'},
  {icon: 'car-multiple', label: 'Cars', navigateTo: 'Cars', color: '#34495e'},
  {
    icon: 'account',
    label: 'Profile',
    navigateTo: 'Profile',
    color: '#497285',
  },
  {
    icon: 'cart',
    label: 'Orders',
    navigateTo: 'Orders',
    color: '#e8751a',
  },
  {
    icon: 'heart',
    label: 'Favoris',
    navigateTo: 'FavCar',
    color: '#da4949',
  },
  {icon: 'book-open-variant', label: 'Blogs', navigateTo: 'Blogs', color: '#34495e'},
  {
    icon: 'help-circle',
    label: 'FAQs',
    navigateTo: 'Faqs',
    color: '#34495e',
  },
  {
    icon: 'information',
    label: 'About Us',
    navigateTo: 'About',
    color: '#3a9679',
  },
];

const DrawerLayout = ({icon, label, navigateTo, color}) => {
  const navigation = useNavigation();
  return (
    <DrawerItem
      icon={({size}) => <Icon name={icon} color={color} size={size} />}
      label={() => <Text style={styles.drawerLabel}>{label}</Text>}
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
      color={el.color}
    />
  ));
};

function DrawerContent({setIsLoggedIn, ...props}) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
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
    <View style={{flex: 1}}>
      <DrawerContentScrollView {...props} contentContainerStyle={{paddingTop: 0}}>
        <View style={styles.drawerContent}>
          <TouchableOpacity activeOpacity={0.8}>
            <LinearGradient
              colors={['#006200', '#60A23C', '#97DA6F']}
              style={styles.userInfoSection}>
              <View style={{flexDirection: 'row', marginTop: 20}}>
                <Avatar.Image
                  source={{
                    uri: userData?.image || 'https://via.placeholder.com/50',
                  }}
                  size={60}
                />
                <View style={{marginLeft: 15, flexDirection: 'column'}}>
                  <Title style={styles.title}>
                    {userData?.prenom} {userData?.nom}
                  </Title>
                  <Text style={styles.caption} numberOfLines={1}>
                    {userData?.email}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.drawerSection}>
            <DrawerItems />
          </View>
        </View>
      </DrawerContentScrollView>
      <View>
        <DrawerItem
          icon={({size}) => (
            <Icon
              name="exit-to-app"
              color="#FF4500"
              size={size}
              style={styles.icon3D}
            />
          )}
          label="Sign Out"
          labelStyle={styles.signOutLabel}
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
    paddingVertical: 25,
  },
  title: {
    fontSize: 18,
    marginTop: 3,
    fontWeight: 'bold',
    color: '#FFF',
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
    color: '#FFF',
  },
  drawerSection: {
    marginTop: 25,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerLabel: {
    fontSize: 16,
    color: '#000',
  },
  signOutLabel: {
    color: '#FF4500',
  },

});

export default DrawerContent;
