import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
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

  const navigation = useNavigation();

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const clientId = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('token');
        if (!clientId || !token) {
          throw new Error('Client ID or token not found');
        }

        const response = await fetch(`http://192.168.1.185:3001/users/clients/${clientId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch client data');
        }

        const data = await response.json();
        setClient({
          ...data,
          dateNaissance: data.dateNaissance ? new Date(data.dateNaissance).toISOString().split('T')[0] : '',
          dateExpirationPermis: data.dateExpirationPermis ? new Date(data.dateExpirationPermis).toISOString().split('T')[0] : '',
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
      const response = await fetch(`http://192.168.1.185:3001/users/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

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
    try {
      const clientId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.1.185:3001/users/update-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: clientId, oldPassword, newPassword }),
      });

      if (!response.ok) {
        throw new Error('Failed to update password');
      }

      Alert.alert('Success', 'Password updated successfully');
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleBirthDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowBirthDatePicker(false);
    setClient({ ...client, dateNaissance: currentDate.toISOString().split('T')[0] });
  };

  const handleLicenseExpiryChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowLicenseExpiryPicker(false);
    setClient({ ...client, dateExpirationPermis: currentDate.toISOString().split('T')[0] });
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
          setClient({ ...client, image: `data:${selectedImage.type};base64,${selectedImage.base64}` });
        }
      },
    );
  };

  const isAdult = (date) => {
    const today = new Date();
    const birthDate = new Date(date);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
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
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="auto" />
      {[
        { label: 'First Name', value: client.nom, onChange: text => setClient({ ...client, nom: text }), icon: 'person' },
        { label: 'Last Name', value: client.prenom, onChange: text => setClient({ ...client, prenom: text }), icon: 'person' },
        { label: 'Email', value: client.email, onChange: text => setClient({ ...client, email: text }), icon: 'email', keyboardType: 'email-address' },
        { label: 'Address', value: client.adresse, onChange: text => setClient({ ...client, adresse: text }), icon: 'home' },
        { label: 'CIN', value: client.CIN, onChange: text => setClient({ ...client, CIN: text }), icon: 'badge' },
        { label: 'Passport', value: client.passport, onChange: text => setClient({ ...client, passport: text }), icon: 'card-membership' },
      ].map((input, index) => (
        <View key={index} style={styles.inputContainer}>
          <Icon name={input.icon} size={24} color="gray" style={styles.inputIcon} />
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
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {client.image ? (
          <Image source={{ uri: client.image }} style={styles.imagePreview} />
        ) : (
          <Text style={styles.imagePlaceholder}>Pick an image</Text>
        )}
      </TouchableOpacity>
      <View style={styles.inputContainer}>
        <Icon name="calendar-today" size={24} color="gray" style={styles.inputIcon} />
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
            value={client.dateNaissance ? new Date(client.dateNaissance) : new Date()}
            mode="date"
            display="default"
            onChange={handleBirthDateChange}
          />
        )}
      </View>
      <View style={styles.inputContainer}>
        <Icon name="drive-eta" size={24} color="gray" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Driver's License Number"
          placeholderTextColor="gray"
          value={client.numPermisConduire}
          onChangeText={text => setClient({ ...client, numPermisConduire: text })}
        />
      </View>
      <View style={styles.inputContainer}>
        <Icon name="calendar-today" size={24} color="gray" style={styles.inputIcon} />
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
            value={client.dateExpirationPermis ? new Date(client.dateExpirationPermis) : new Date()}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  logo: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 40,
    backgroundColor: '#f9f9f9',
  },
  inputIcon: {
    position: 'absolute',
    left: 10,
  },
  imagePicker: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  imagePlaceholder: {
    color: 'gray',
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
