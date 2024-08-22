import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,Linking } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome'; // Add this line for icons
import { API_URL } from 'react-native-dotenv';
import Config from 'react-native-config'; 
const AboutScreen = () => {
  const [socialMedia, setSocialMedia] = useState(null);

  useEffect(() => {
    const fetchSocialMedia = async () => {
      try {
        const response = await axios.get(`${Config.API_URL}/socialmedia`);
        setSocialMedia(response.data);
      } catch (error) {
        console.error('Error fetching social media data', error);
      }
    };

    fetchSocialMedia();
  }, []);

  const openLink = (url) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const handlePhonePress = () => {
    if (socialMedia?.numTel) {
      Linking.openURL(`tel:${socialMedia.numTel}`);
    }
  };

  const handleEmailPress = () => {
    if (socialMedia?.email) {
      Linking.openURL(`mailto:${socialMedia.email}`);
    }
  };

  const handleLocationPress = () => {
    if (socialMedia?.localisation) {
      const location = encodeURIComponent(socialMedia.localisation);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${location}`;
      Linking.openURL(mapsUrl);
    }
  };

  if (!socialMedia) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/logo2.png')} style={styles.logo} />
        <Text style={styles.tagline}>Your Trusted Car Rental Agency</Text>
      </View>

      <Text style={styles.heading}>Contact Information</Text>

      <TouchableOpacity style={styles.contactRow} onPress={handlePhonePress}>
        <Icon name="phone" size={20} color="#333" />
        <Text style={styles.info}>Phone: {socialMedia.numTel}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.contactRow} onPress={handleEmailPress}>
        <Icon name="envelope" size={20} color="#333" />
        <Text style={styles.info}>Email: {socialMedia.email}</Text>
      </TouchableOpacity>

      <View style={styles.contactRow}>
        <Icon name="clock-o" size={20} color="#333" />
        <Text style={styles.info}>Working Hours: {socialMedia.tempsDeTravail}</Text>
      </View>

      <Text style={styles.heading}>Follow Us</Text>
      <View style={styles.socialContainer}>
        {socialMedia.lienFacebook && (
          <TouchableOpacity style={styles.socialButton} onPress={() => openLink(socialMedia.lienFacebook)}>
            <Icon name="facebook" size={24} color="#3b5998" />
            <Text style={styles.linkText}>Facebook</Text>
          </TouchableOpacity>
        )}
        {socialMedia.lienTwitter && (
          <TouchableOpacity style={styles.socialButton} onPress={() => openLink(socialMedia.lienTwitter)}>
            <Icon name="twitter" size={24} color="#1DA1F2" />
            <Text style={styles.linkText}>Twitter</Text>
          </TouchableOpacity>
        )}
        {socialMedia.lienYoutube && (
          <TouchableOpacity style={styles.socialButton} onPress={() => openLink(socialMedia.lienYoutube)}>
            <Icon name="youtube" size={24} color="#FF0000" />
            <Text style={styles.linkText}>YouTube</Text>
          </TouchableOpacity>
        )}
        {socialMedia.lienPinterest && (
          <TouchableOpacity style={styles.socialButton} onPress={() => openLink(socialMedia.lienPinterest)}>
            <Icon name="pinterest" size={24} color="#E60023" />
            <Text style={styles.linkText}>Pinterest</Text>
          </TouchableOpacity>
        )}
        {socialMedia.lienInstagram && (
          <TouchableOpacity style={styles.socialButton} onPress={() => openLink(socialMedia.lienInstagram)}>
            <Icon name="instagram" size={24} color="#C13584" />
            <Text style={styles.linkText}>Instagram</Text>
          </TouchableOpacity>
        )}
        {socialMedia.lienLinkedin && (
          <TouchableOpacity style={styles.socialButton} onPress={() => openLink(socialMedia.lienLinkedin)}>
            <Icon name="linkedin" size={24} color="#0077B5" />
            <Text style={styles.linkText}>LinkedIn</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.heading}>Location</Text>

      <TouchableOpacity style={styles.contactRow} onPress={handleLocationPress}>
        <Icon name="map-marker" size={20} color="#333" />
        <Text style={styles.info}>{socialMedia.localisation}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: '50%',
    height: undefined,
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  tagline: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#333333',
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  info: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  socialContainer: {
    marginTop: 20,
    marginBottom: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 10,
  },
  linkText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 10,
  },
});

export default AboutScreen;
