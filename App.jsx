import React, { useState, useEffect } from 'react';
import 'react-native-gesture-handler';
import { Image, TouchableOpacity } from 'react-native';
import HomeScreen from './Screens/HomeScreen';
import ProfileScreen from './Screens/ProfileScreen';
import UserScreen from './Screens/UserScreen';
import LoginScreen from './Screens/LoginScreen';
import SignupScreen from './Screens/SignupScreen';
import { NavigationContainer, useNavigation, DrawerActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DrawerContent from './DrawerContents';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const Stacknav = () => {
  const navigation = useNavigation();
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        statusBarColor: '#0163d2',
        headerStyle: {
          backgroundColor: '#0163d2',
        },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerLeft: () => {
          return (
            <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
              <Image
                source={require('./assets/menu.png')}
                style={{ width: 25, height: 25, marginLeft: 10 }}
              />
            </TouchableOpacity>
          );
        },
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: true,
        }}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="User" component={UserScreen} />
    </Stack.Navigator>
  );
};

const DrawerNav = ({ setIsLoggedIn }) => {
  return (
    <Drawer.Navigator
      drawerContent={props => <DrawerContent {...props} setIsLoggedIn={setIsLoggedIn} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Drawer.Screen name="MainHome" component={Stacknav} />
    </Drawer.Navigator>
  );
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const isAuth = await AsyncStorage.getItem('isAuth');
        if (isAuth === 'true') {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Failed to fetch login status:', error);
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <DrawerNav setIsLoggedIn={setIsLoggedIn} />
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
