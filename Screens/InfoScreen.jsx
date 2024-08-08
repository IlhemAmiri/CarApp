import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';

const backIcon = require('../assets/left-arrow.png');
const dotsIcon = require('../assets/dots.png');

const InfoScreen = ({ route, navigation }) => {
  const [vehicle, setVehicle] = useState(null);
  const { id } = route.params;

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await axios.get(`http://192.168.1.185:3001/cars/${id}`);
        setVehicle(response.data);
      } catch (error) {
        console.error('Error fetching vehicle data:', error);
      }
    };
    fetchVehicle();
  }, [id]);

  if (!vehicle) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#1ECB15" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Image source={backIcon} style={styles.icon} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Detail</Text>
          <Image source={dotsIcon} style={styles.icon} />
        </View>

        <FlatList
          data={[vehicle.image, vehicle.image2, vehicle.image3, vehicle.image4]}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.vehicleImage} />
          )}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imageContainer}
        />

        <View style={styles.details}>
          <View style={styles.topText}>
            <Text style={styles.modelText}>{`${vehicle.marque} ${vehicle.modele} ${vehicle.anneeFabrication}`}</Text>
            <Text style={styles.priceText}>
              <Text style={styles.priceAmount}>{`$${vehicle.prixParJ}`}</Text> /day
            </Text>
          </View>
          <Text style={styles.categoryText}>
            {`${vehicle.categorie} - ${vehicle.typeTransmission}`}
          </Text>
          <Text style={styles.description}>{vehicle.caracteristiques}</Text>

          <Text style={styles.sectionTitle}>Properties</Text>
          <View style={styles.properties}>
            <View style={styles.propertyItem}>
              <Text style={styles.propertyText}>
                Motor power: <Text style={styles.propertyValue}>{`${vehicle.kilometrage} hp`}</Text>
              </Text>
              <Text style={styles.propertyText}>
                Engine capacity: <Text style={styles.propertyValue}>{`${vehicle.kilometrage} cc`}</Text>
              </Text>
            </View>
            <View style={styles.propertyItem}>
              <Text style={styles.propertyText}>
                Fuel: <Text style={styles.propertyValue}>{vehicle.typeCarburant}</Text>
              </Text>
              <Text style={styles.propertyText}>
                Traction: <Text style={styles.propertyValue}>{vehicle.typeTransmission}</Text>
              </Text>
              <Text>{vehicle.NbPortes}{vehicle.climatisation}{vehicle.NbPortes} </Text>
              <Text>{vehicle.accessoiresOptionSupp}{vehicle.caracteristiques}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.rentButton}>
            <Text style={styles.rentButtonText}>Rent a Car</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default InfoScreen;

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#F8F8F8',
    },
    container: {
      flex: 1,
      paddingHorizontal: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: 20,
    },
    icon: {
      width: 25,
      height: 25,
    },
    headerText: {
      fontSize: 18,
      fontWeight: '600',
    },
    imageContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 30, // Adjust this margin as needed
    },
    vehicleImage: {
      width: 300,
      height: 200,
      borderRadius: 10,
      marginHorizontal: 5,
    },
    details: {
      flexGrow: 1,
      flexShrink: 1,
    },
    topText: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    modelText: {
      fontSize: 22,
      fontWeight: '600',
    },
    priceText: {
      fontSize: 16,
      fontWeight: '400',
    },
    priceAmount: {
      fontWeight: '700',
    },
    categoryText: {
      fontSize: 14,
      color: '#696969',
      marginBottom: 10,
    },
    description: {
      fontSize: 14,
      color: '#696969',
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 10,
    },
    properties: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    propertyItem: {
      flex: 1,
    },
    propertyText: {
      fontSize: 14,
      color: '#696969',
      marginBottom: 5,
    },
    propertyValue: {
      color: '#000',
    },
    rentButton: {
      backgroundColor: '#000',
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      marginTop: 20,
    },
    rentButtonText: {
      color: '#FFF',
      fontWeight: '600',
      fontSize: 16,
    },
  });
  