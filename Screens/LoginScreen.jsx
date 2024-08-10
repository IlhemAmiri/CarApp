import React, {useState, useEffect} from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Checkbox from 'expo-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({navigation, setIsLoggedIn}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({email: '', password: ''});
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  useEffect(() => {
    setIsEmailValid(validateEmail(email));
  }, [email]);

  useEffect(() => {
    setIsPasswordValid(validatePassword(password));
  }, [password]);

  const validateEmail = email => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = password => {
    return password.length >= 8;
  };

  const handleLogin = async () => {
    const emailError = validateEmail(email)
      ? ''
      : 'Please enter a valid email address';
    const passwordError = validatePassword(password)
      ? ''
      : 'Password must be at least 8 characters long';

    if (emailError || passwordError) {
      setErrors({email: emailError, password: passwordError});
      return;
    }

    try {
      const response = await fetch('http://192.168.1.185:3001/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, password}),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Login successful', data);
      setIsLoggedIn(true);

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('role', data.role || 'client');
      await AsyncStorage.setItem('isAuth', 'true');
      await AsyncStorage.setItem('userId', data.userId);
      logStoredValues();
    } catch (error) {
      console.error('There was a problem with the login request:', error);
    }
  };
  const logStoredValues = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const role = await AsyncStorage.getItem('role');
      const isAuth = await AsyncStorage.getItem('isAuth');
      const userId = await AsyncStorage.getItem('userId');

      console.log('Stored values:');
      console.log('Token:', token);
      console.log('Role:', role);
      console.log('Is Authenticated:', isAuth);
      console.log('User ID:', userId);
    } catch (error) {
      console.error('Error retrieving data from AsyncStorage:', error);
    }
  };
  return (
    <ImageBackground
      source={require('../assets/bg.png')}
      style={styles.background}>
      <View style={styles.container}>
        <StatusBar style="auto" />
        <Image source={require('../assets/logo1.png')} style={styles.logo} />

        <View style={styles.inputContainer}>
          <Icon name="email" size={24} color="gray" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="gray"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={text => {
              setEmail(text);
              setEmailTouched(true);
            }}
          />
          {emailTouched && (
            <Icon
              name={isEmailValid ? 'check-circle' : 'cancel'}
              size={24}
              color={isEmailValid ? 'green' : 'red'}
              style={styles.validationIcon}
            />
          )}
        </View>
        {errors.email ? (
          <Text style={styles.errorText}>{errors.email}</Text>
        ) : null}

        <View style={styles.inputContainer}>
          <Icon name="lock" size={24} color="gray" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="gray"
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={text => {
              setPassword(text);
              setPasswordTouched(true);
            }}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setPasswordVisible(!passwordVisible)}>
            <Icon
              name={passwordVisible ? 'visibility-off' : 'visibility'}
              size={24}
              color="gray"
            />
          </TouchableOpacity>
          {passwordTouched && (
            <Icon
              name={isPasswordValid ? 'check-circle' : 'cancel'}
              size={24}
              color={isPasswordValid ? 'green' : 'red'}
              style={styles.validationIcon}
            />
          )}
        </View>
        {errors.password ? (
          <Text style={styles.errorText}>{errors.password}</Text>
        ) : null}

        <View style={styles.rememberMeForgotPasswordContainer}>
          <View style={styles.rememberMeContainer}>
            <Checkbox
              value={rememberMe}
              onValueChange={setRememberMe}
              color={rememberMe ? '#1ECB15' : undefined}
              style={styles.checkbox}
            />
            <Text style={styles.rememberMeText}>Remember Me</Text>
          </View>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.googleButton}>
          <Image
            source={require('../assets/google.png')}
            style={styles.googleLogo}
          />
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity>

        <Text style={styles.createAccount}>
          Don't have an account?
          <Text
            style={styles.createAccountLink}
            onPress={() => navigation.navigate('Signup')}>
            Create one
          </Text>
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: '45%',
    height: undefined,
    aspectRatio: 1,
    resizeMode: 'contain',
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingLeft: 15,
  },
  input: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    color: '#000',
  },
  inputIcon: {
    marginRight: 10,
  },
  validationIcon: {
    marginRight: 10,
  },
  eyeIcon: {
    marginRight: 15,
  },
  errorText: {
    width: '100%',
    color: 'red',
    marginBottom: 10,
    textAlign: 'left',
  },
  rememberMeForgotPasswordContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 8,
  },
  rememberMeText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  forgotPassword: {
    color: '#1ECB15',
    fontWeight: 'bold',
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#1ECB15',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  googleLogo: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    color: '#333',
  },
  createAccount: {
    color: '#fff',
    marginTop: 10,
  },
  createAccountLink: {
    color: '#1ECB15',
    fontWeight: 'bold',
  },
});
