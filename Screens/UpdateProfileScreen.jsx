import React, {useState, useEffect} from 'react';
import {
  StatusBar,
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
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UpdateProfileScreen() {
  const [client, setClient] = useState({
    nom: '',
    prenom: '',
    email: '',
    numTel: '',
    adresse: '',
    CIN: '',
    passport: '',
    dateNaissance: '',
    numPermisConduire: '',
    dateExpirationPermis: '',
    image: null,
  });
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [showLicenseExpiryPicker, setShowLicenseExpiryPicker] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const clientId = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('token');
        if (!clientId || !token) {
          throw new Error('Client ID or token not found');
        }

        const response = await fetch(
          `http://192.168.1.185:3001/users/clients/${clientId}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (!response.ok) {
          throw new Error('Failed to fetch client data');
        }

        const data = await response.json();
        setClient({
          ...data,
          dateNaissance: data.dateNaissance
            ? new Date(data.dateNaissance).toISOString().split('T')[0]
            : '',
          dateExpirationPermis: data.dateExpirationPermis
            ? new Date(data.dateExpirationPermis).toISOString().split('T')[0]
            : '',
        });
      } catch (error) {
        setError(error.message);
      }
    };

    fetchClientData();
  }, []);

  const handleUpdate = async () => {
    if (!isAdult(client.dateNaissance)) {
      setError('You must be at least 18 years old.');
      return;
    }

    const formData = new FormData();
    for (const key in client) {
      if (client[key]) {
        formData.append(key, client[key]);
      }
    }

    try {
      const clientId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        `http://192.168.1.185:3001/users/clients/${clientId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error('Failed to update client data');
      }

      const data = await response.json();
      setClient(data);
      navigation.navigate('Profile');
    } catch (error) {
      setError(error.message);
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
  
    try {
      const clientId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        'http://192.168.1.185:3001/users/update-password',
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({userId: clientId, oldPassword, newPassword}),
        },
      );
  
      if (!response.ok) {
        throw new Error('Failed to update password');
      }
  
      Alert.alert('Success', 'Password updated successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError(error.message);
    }
  };
  
  const handleBirthDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowBirthDatePicker(false);
    setClient({
      ...client,
      dateNaissance: currentDate.toISOString().split('T')[0],
    });
  };

  const handleLicenseExpiryChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowLicenseExpiryPicker(false);
    setClient({
      ...client,
      dateExpirationPermis: currentDate.toISOString().split('T')[0],
    });
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
          setClient({
            ...client,
            image: `data:${selectedImage.type};base64,${selectedImage.base64}`,
          });
        }
      },
    );
  };

  const isAdult = date => {
    const today = new Date();
    const birthDate = new Date(date);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      return age - 1 >= 18;
    }
    return age >= 18;
  };

  if (!client.nom && !error) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {client.image ? (
            <Image source={{uri: client.image}} style={styles.imagePreview} />
          ) : (
            <Text style={styles.imagePlaceholder}>Pick an image</Text>
          )}
        </TouchableOpacity>
        <StatusBar style="auto" />
        {[
          {
            label: 'First Name',
            value: client.nom,
            onChange: text => setClient({...client, nom: text}),
            icon: 'person',
          },
          {
            label: 'Last Name',
            value: client.prenom,
            onChange: text => setClient({...client, prenom: text}),
            icon: 'person',
          },
          {
            label: 'Email',
            value: client.email,
            onChange: text => setClient({...client, email: text}),
            icon: 'email',
            keyboardType: 'email-address',
          },
          {
            label: 'Phone Number',
            value: client.numTel,
            onChange: text => setClient({...client, numTel: text}),
            icon: 'phone',
            keyboardType: 'phone-pad',
          },
          {
            label: 'Address',
            value: client.adresse,
            onChange: text => setClient({...client, adresse: text}),
            icon: 'home',
          },
          {
            label: 'CIN',
            value: client.CIN,
            onChange: text => setClient({...client, CIN: text}),
            icon: 'badge',
          },
          {
            label: 'Passport',
            value: client.passport,
            onChange: text => setClient({...client, passport: text}),
            icon: 'card-membership',
          },
        ].map((input, index) => (
          <View key={index} style={styles.inputContainer}>
            <Icon
              name={input.icon}
              size={24}
              color="gray"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder={input.label}
              placeholderTextColor="gray"
              value={input.value}
              onChangeText={input.onChange}
              keyboardType={input.keyboardType || 'default'}
            />
          </View>
        ))}
        
        <View style={styles.inputContainer}>
          <Icon
            name="calendar-today"
            size={24}
            color="gray"
            style={styles.inputIcon}
          />
          <TouchableOpacity onPress={() => setShowBirthDatePicker(true)}>
            <TextInput
              style={styles.input}
              placeholder="Date of Birth"
              placeholderTextColor="gray"
              value={client.dateNaissance}
              editable={false}
            />
          </TouchableOpacity>
          {showBirthDatePicker && (
            <DateTimePicker
              value={
                client.dateNaissance
                  ? new Date(client.dateNaissance)
                  : new Date()
              }
              mode="date"
              display="default"
              onChange={handleBirthDateChange}
            />
          )}
        </View>
        <View style={styles.inputContainer}>
          <Icon
            name="drive-eta"
            size={24}
            color="gray"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Driver's License Number"
            placeholderTextColor="gray"
            value={client.numPermisConduire}
            onChangeText={text =>
              setClient({...client, numPermisConduire: text})
            }
          />
        </View>
        <View style={styles.inputContainer}>
          <Icon
            name="calendar-today"
            size={24}
            color="gray"
            style={styles.inputIcon}
          />
          <TouchableOpacity onPress={() => setShowLicenseExpiryPicker(true)}>
            <TextInput
              style={styles.input}
              placeholder="License Expiry Date"
              placeholderTextColor="gray"
              value={client.dateExpirationPermis}
              editable={false}
            />
          </TouchableOpacity>
          {showLicenseExpiryPicker && (
            <DateTimePicker
              value={
                client.dateExpirationPermis
                  ? new Date(client.dateExpirationPermis)
                  : new Date()
              }
              mode="date"
              display="default"
              onChange={handleLicenseExpiryChange}
            />
          )}
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
          <Text style={styles.updateButtonText}>Update Profile</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <Icon name="lock" size={24} color="gray" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Old Password"
          placeholderTextColor="gray"
          secureTextEntry={!passwordVisible}
          value={oldPassword}
          onChangeText={text => setOldPassword(text)}
        />
        <TouchableOpacity
          onPress={() => setPasswordVisible(!passwordVisible)}
          style={styles.passwordToggleIcon}>
          <Icon
            name={passwordVisible ? 'visibility-off' : 'visibility'}
            size={24}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock" size={24} color="gray" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor="gray"
          secureTextEntry={!passwordVisible}
          value={newPassword}
          onChangeText={text => setNewPassword(text)}
        />
        <TouchableOpacity
          onPress={() => setPasswordVisible(!passwordVisible)}
          style={styles.passwordToggleIcon}>
          <Icon
            name={passwordVisible ? 'visibility-off' : 'visibility'}
            size={24}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock" size={24} color="gray" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          placeholderTextColor="gray"
          secureTextEntry={!passwordVisible}
          value={confirmPassword}
          onChangeText={text => setConfirmPassword(text)}
        />
        <TouchableOpacity
          onPress={() => setPasswordVisible(!passwordVisible)}
          style={styles.passwordToggleIcon}>
          <Icon
            name={passwordVisible ? 'visibility-off' : 'visibility'}
            size={24}
            color="gray"
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
          style={styles.updateButtonpassword}
          onPress={handlePasswordUpdate}>
          <Text style={styles.updateButtonText}>Update Password</Text>
        </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    height: 50,
    paddingLeft: 50,
    fontSize: 16,
    color: '#333',
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    color: '#888',
  },
  imagePicker: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
    
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#1CAC78',
  },
  imagePlaceholder: {
    color: '#888',
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#1CAC78',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  updateButtonpassword: {
    backgroundColor: '#1CAC78',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 20,
    marginHorizontal:20,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordToggleIcon: {
    position: 'absolute',
    right: 15,
  },
  
});
