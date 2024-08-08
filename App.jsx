import React, {useState, useEffect} from 'react';
import 'react-native-gesture-handler';
import {ActivityIndicator, View, TouchableOpacity, Image} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import CarsScreen from './Screens/CarsScreen';
import ProfileScreen from './Screens/ProfileScreen';
import InfoScreen from './Screens/InfoScreen';
import FavCarScreen from './Screens/FavCarScreen';
import LoginScreen from './Screens/LoginScreen';
import SignupScreen from './Screens/SignupScreen';
import HomeScreen from './Screens/HomeScreen';
import BookingScreen from './Screens/BookingScreen';
import OrdersScreen from './Screens/OrdersScreen';
import {
  NavigationContainer,
  useNavigation,
  DrawerActions,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DrawerContent from './DrawerContents';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const SPACING = 10;
const colors = {
  light: '#f0f0f0',
  'dark-gray': '#333333',
  black: '#000000',
  yellow: '#FFD700',
};

const fetchUser = async (setUserData, setLoading) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const userId = await AsyncStorage.getItem('userId');
    const response = await axios.get(
      `http://192.168.1.185:3001/users/clients/${userId}`,
      {
        headers: {Authorization: `Bearer ${token}`},
      },
    );
    setUserData(response.data);
  } catch (error) {
    console.error('Error fetching user data:', error);
  } finally {
    setLoading(false);
  }
};

const Stacknav = ({userData}) => {
  const navigation = useNavigation();
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        statusBarColor: '#0163d2',
        headerStyle: {
          backgroundColor: '#f0f0f0',
        },
        headerTintColor: '#000',
        headerTitleAlign: 'center',
        headerLeft: () => (
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <LinearGradient
              style={{
                height: SPACING * 4,
                width: SPACING * 4,
                borderRadius: SPACING * 2,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              colors={[colors.light, colors['dark-gray']]}>
              <TouchableOpacity
                style={{
                  height: SPACING * 3,
                  width: SPACING * 3,
                  backgroundColor: colors.black,
                  borderRadius: SPACING * 1.5,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                <MaterialCommunityIcons
                  name="dots-horizontal"
                  color={colors.light}
                  size={SPACING * 2}
                />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ),
        headerRight: () => (
          <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
            <LinearGradient
              style={{
                height: SPACING * 4,
                width: SPACING * 4,
                borderRadius: SPACING * 2,
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: SPACING * 2,
              }}
              colors={[colors.light, colors['dark-gray']]}>
              <TouchableOpacity
                style={{
                  height: SPACING * 3,
                  width: SPACING * 3,
                  backgroundColor: colors.black,
                  borderRadius: SPACING * 1.5,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => navigation.navigate('Profile')}>
                <Image
                  source={{
                    uri: userData?.image || 'https://via.placeholder.com/50',
                  }}
                  style={{
                    height: '100%',
                    width: '100%',
                    borderRadius: SPACING * 1.5,
                  }}
                />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ),
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: true,
          title: '', // Hide the title
        }}
      />
      <Stack.Screen
        name="Cars"
        component={CarsScreen}
        options={{
          headerShown: true,
          title: 'Car Listings', // Hide the title
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: true,
          title: '', // Hide the title
        }}
      />
      <Stack.Screen
        options={{
          headerShown: false,
          title: '', // Hide the title
        }}
        name="Info"
        component={InfoScreen}
      />
      <Stack.Screen
        options={{
          headerShown: false,
          title: '', // Hide the title
        }}
        name="Booking"
        component={BookingScreen}
      />
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'My Order', 
        }}
        name="Orders"
        component={OrdersScreen}
      />
      <Stack.Screen
        options={{
          headerShown: true,
          title: '', 
        }}
        name="FavCar"
        component={FavCarScreen}
      />
    </Stack.Navigator>
  );
};

const DrawerNav = ({setIsLoggedIn, userData}) => {
  return (
    <Drawer.Navigator
      drawerContent={props => (
        <DrawerContent {...props} setIsLoggedIn={setIsLoggedIn} />
      )}
      screenOptions={{
        headerShown: false,
      }}>
      <Drawer.Screen name="MainHome">
        {props => <Stacknav {...props} userData={userData} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const isAuth = await AsyncStorage.getItem('isAuth');
        if (isAuth === 'true') {
          setIsLoggedIn(true);
          fetchUser(setUserData, setLoading);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch login status:', error);
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <DrawerNav setIsLoggedIn={setIsLoggedIn} userData={userData} />
      ) : (
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="Login">
            {props => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
          </Stack.Screen>
          <Stack.Screen name="Signup" component={SignupScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default App;
