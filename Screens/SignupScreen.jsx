import React, {useState} from 'react';
import {StatusBar} from 'react-native';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import CountryPicker from 'react-native-country-picker-modal';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

export default function SignupScreen() {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cin, setCin] = useState('');
  const [passport, setPassport] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('TN');
  const [callingCode, setCallingCode] = useState('216');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState('');
  const [drivingLicenseExpiry, setDrivingLicenseExpiry] = useState(new Date());
  const [showLicenseExpiryPicker, setShowLicenseExpiryPicker] = useState(false);
  const [image, setImage] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const navigation = useNavigation();

  const handleSignup = async () => {
    if (!validateFields()) return;

    try {
      const fullPhoneNumber = `+${callingCode}${phoneNumber}`;
      const response = await axios.post(
        'http://192.168.1.185:3001/users/register',
        {
          nom: firstName,
          prenom: lastName,
          email,
          password,
          CIN: cin,
          passport,
          adresse: address,
          numTel: fullPhoneNumber,
          dateNaissance: birthDate,
          numPermisConduire: drivingLicenseNumber,
          dateExpirationPermis: drivingLicenseExpiry,
          image,
        },
      );
      console.log('Signup successful', response.data);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Signup error', error);
      Alert.alert('Signup failed', error.message);
    }
  };

  const pickImage = async () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxHeight: 200,
        maxWidth: 200,
        quality: 1,
        includeBase64: true,
      },
      response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
          Alert.alert('Image Picker Error', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const selectedImage = response.assets[0];
          setImage(`data:${selectedImage.type};base64,${selectedImage.base64}`);
        }
      },
    );
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSignup();
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const validateFields = () => {
    if (step === 1) {
      if (!firstName || !lastName || !email || !password) {
        Alert.alert('All fields are required');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('Invalid email address');
        return false;
      }
      if (password.length < 6) {
        Alert.alert('Password must be at least 6 characters long');
        return false;
      }
    } else if (step === 2) {
      if (!cin || !passport || !address || !phoneNumber) {
        Alert.alert('All fields are required');
        return false;
      }
    } else if (step === 3) {
      if (!birthDate || !drivingLicenseNumber || !drivingLicenseExpiry) {
        Alert.alert('All fields are required');
        return false;
      }
      const age = new Date().getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        Alert.alert('You must be at least 18 years old');
        return false;
      }
    }
    return true;
  };

  const handleBirthDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || birthDate;
    setShowBirthDatePicker(false);
    setBirthDate(currentDate);
  };

  const handleLicenseExpiryChange = (event, selectedDate) => {
    const currentDate = selectedDate || drivingLicenseExpiry;
    setShowLicenseExpiryPicker(false);
    setDrivingLicenseExpiry(currentDate);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <View style={styles.inputContainer}>
              <Icon
                name="person"
                size={24}
                color="gray"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor="gray"
                value={firstName}
                onChangeText={text => setFirstName(text)}
                required
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon
                name="person"
                size={24}
                color="gray"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor="gray"
                value={lastName}
                onChangeText={text => setLastName(text)}
                required
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon
                name="email"
                size={24}
                color="gray"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="gray"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={text => setEmail(text)}
                required
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon
                name="lock"
                size={24}
                color="gray"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="gray"
                secureTextEntry={!passwordVisible}
                value={password}
                onChangeText={text => setPassword(text)}
                required
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}>
                <Icon
                  name={passwordVisible ? 'visibility-off' : 'visibility'}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
          </>
        );
      case 2:
        return (
          <>
            <View style={styles.inputContainer}>
              <Icon
                name="badge"
                size={24}
                color="gray"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="CIN"
                placeholderTextColor="gray"
                value={cin}
                onChangeText={text => setCin(text)}
                required
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon
                name="card-membership"
                size={24}
                color="gray"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Passport"
                placeholderTextColor="gray"
                value={passport}
                onChangeText={text => setPassport(text)}
                required
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon
                name="home"
                size={24}
                color="gray"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Address"
                placeholderTextColor="gray"
                value={address}
                onChangeText={text => setAddress(text)}
                required
              />
            </View>
            <View style={styles.phoneInputContainer}>
              <CountryPicker
                countryCode={countryCode}
                withFilter
                withFlag
                withCountryNameButton
                withAlphaFilter
                withCallingCode
                onSelect={country => {
                  setCountryCode(country.cca2);
                  setCountry(country);
                }}
              />
              <TextInput
                style={styles.phoneInput}
                placeholder="Phone Number"
                placeholderTextColor="gray"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={text => setPhoneNumber(text)}
                required
              />
            </View>
          </>
        );
      case 3:
        return (
          <>
            <View style={styles.inputContainer}>
              <Icon
                name="cake"
                size={24}
                color="gray"
                style={styles.inputIcon}
              />
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowBirthDatePicker(true)}>
                <Text style={styles.dateText}>{birthDate.toDateString()}</Text>
              </TouchableOpacity>
              {showBirthDatePicker && (
                <DateTimePicker
                  value={birthDate}
                  mode="date"
                  display="default"
                  onChange={handleBirthDateChange}
                  maximumDate={
                    new Date(
                      new Date().setFullYear(new Date().getFullYear() - 18),
                    )
                  }
                />
              )}
            </View>
            <View style={styles.inputContainer}>
              <Icon
                name="directions-car"
                size={24}
                color="gray"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Driving License Number"
                placeholderTextColor="gray"
                value={drivingLicenseNumber}
                onChangeText={text => setDrivingLicenseNumber(text)}
                required
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon
                name="event"
                size={24}
                color="gray"
                style={styles.inputIcon}
              />
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowLicenseExpiryPicker(true)}>
                <Text style={styles.dateText}>{drivingLicenseExpiry.toDateString()}</Text>
              </TouchableOpacity>
              {showLicenseExpiryPicker && (
                <DateTimePicker
                  value={drivingLicenseExpiry}
                  mode="date"
                  display="default"
                  onChange={handleLicenseExpiryChange}
                />
              )}
            </View>
            <TouchableOpacity style={styles.buttonup} onPress={pickImage}>
              <Text style={styles.buttonText}>Upload Image</Text>
            </TouchableOpacity>
            {image && (
              <Image source={{uri: image}} style={styles.uploadedImage} />
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.title}>Create your account </Text>
        <Image source={require('../assets/logo2.png')} style={styles.logo} />
      </View>
      <View style={styles.stepContainer}>
        <View style={[styles.stepCircle, step === 1 && styles.activeStep]}>
          <Text style={styles.stepText}>1</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={[styles.stepCircle, step === 2 && styles.activeStep]}>
          <Text style={styles.stepText}>2</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={[styles.stepCircle, step === 3 && styles.activeStep]}>
          <Text style={styles.stepText}>3</Text>
        </View>
      </View>
      {renderStep()}
      <View style={styles.buttonContainer}>
        {step > 1 && (
          <TouchableOpacity style={styles.button} onPress={handlePreviousStep}>
            <Text style={styles.buttonText}>Previous</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.button} onPress={handleNextStep}>
          <Text style={styles.buttonText}>
            {step === 3 ? 'Sign Up' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.googleButton}>
        <Image
          source={require('../assets/google.png')}
          style={styles.googleLogo}
        />
        <Text style={styles.googleButtonText}>Signup with Google</Text>
      </TouchableOpacity>
      <View style={styles.signInContainer}>
        <Text style={styles.signInText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.signInButton}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color:'#999',
  },
  logo: {
    width: '40%',
    height: undefined,
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: '#1ECB15',
  },
  stepText: {
    color: '#fff',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#ccc',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    padding: 8,
    fontSize: 16,
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#1ECB15',
    padding: 10,
    borderRadius: 20,
    marginBottom: 20,
    marginLeft: 20,
  },
  buttonup: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 20,
    marginBottom: 20,
    marginLeft: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  signInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  signInText: {
    marginRight: 5,
    color:'#999',
  },
  signInButton: {
    color: '#1ECB15',
    fontWeight: 'bold',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  phoneInput: {
    flex: 1,
    marginLeft: 10,
  },
  uploadedImage: {
    width: 100,
    height: 100,
    marginTop: 10,
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
  dateText: {
    color: 'gray',
  },
});
