import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

const backIcon = require('../assets/left-arrow.png');
const dotsIcon = require('../assets/dots.png');
const SPACING = 10;
const colors = {
  light: '#f8f8f8',
  'dark-gray': '#333333',
  black: '#000000',
  yellow: '#FFD700',
  green: '#1ECB15',
  white: '#ffffff',
  gray: '#666666',
};
const InfoScreen = ({route, navigation}) => {
  const [vehicle, setVehicle] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const {id} = route.params;

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await axios.get(
          `http://192.168.1.185:3001/cars/${id}`,
        );
        setVehicle(response.data);
      } catch (error) {
        console.error('Error fetching vehicle data:', error);
      }
    };
    fetchVehicle();
  }, [id]);

  useEffect(() => {
    if (id) {
      axios
        .get(`http://192.168.1.185:3001/notes/car/${id}`)
        .then(response => {
          setNotes(response.data);
          setLoadingNotes(false);
        })
        .catch(error => {
          console.error('There was an error fetching the notes!', error);
          setLoadingNotes(false);
        });
    }
  }, [id]);

  const renderStars = rating => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const quarterStar = rating % 1 >= 0.25 && rating % 1 < 0.5 ? 1 : 0;
  
    return (
      <View style={styles.noteRatingContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <Ionicons key={i} name="star" size={16} color={colors.yellow} />
        ))}
        {halfStar ? (
          <Ionicons name="star-half" size={16} color={colors.yellow} />
        ) : quarterStar ? (
          <Ionicons name="star-outline" size={16} color={colors.yellow} />
        ) : (
          <Text style={{ display: 'none' }}></Text>
        )}
        {[...Array(5 - fullStars - halfStar - quarterStar)].map((_, i) => (
          <Ionicons
            key={i}
            name="star-outline"
            size={16}
            color={colors.yellow}
          />
        ))}
      </View>
    );
  };
  
  if (!vehicle) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={colors.green} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}>
            <Image source={backIcon} style={styles.icon} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Detail</Text>
          <Image source={dotsIcon} style={styles.icon} />
        </View>

        <FlatList
          data={[vehicle.image, vehicle.image2, vehicle.image3, vehicle.image4]}
          renderItem={({item}) => (
            <Image source={{uri: item}} style={styles.vehicleImage} />
          )}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imageContainer}
        />

        <View style={styles.details}>
          <View style={styles.topText}>
            <Text
              style={
                styles.modelText
              }>{`${vehicle.marque} ${vehicle.modele} ${vehicle.anneeFabrication}`}</Text>
            <Text style={styles.priceText}>
              <Text style={styles.priceAmount}>{`$${vehicle.prixParJ}`}</Text>{' '}
              /day
            </Text>
          </View>
          <Text style={styles.categoryText}>
            {`${vehicle.categorie} - ${vehicle.typeTransmission}`}
          </Text>
          <Text style={styles.description}>{vehicle.caracteristiques}</Text>

          <Text style={styles.sectionTitle}>Properties</Text>
          <View style={styles.properties}>
            <View style={styles.propertyItem}>
              <Icon name="speed" size={20} color="#0086D0" />
              <Text style={styles.propertyText}>
                Motor power:{' '}
                <Text
                  style={
                    styles.propertyValue
                  }>{`${vehicle.kilometrage} hp`}</Text>
              </Text>
            </View>
            <View style={styles.propertyItem}>
              <Icon name="local-gas-station" size={20} color="#0086D0" />
              <Text style={styles.propertyText}>
                Fuel:{' '}
                <Text style={styles.propertyValue}>
                  {vehicle.typeCarburant}
                </Text>
              </Text>
            </View>
            <View style={styles.propertyItem}>
              <Icon name="settings" size={20} color="#0086D0" />
              <Text style={styles.propertyText}>
                Engine capacity:{' '}
                <Text
                  style={
                    styles.propertyValue
                  }>{`${vehicle.kilometrage} cc`}</Text>
              </Text>
            </View>
            <View style={styles.propertyItem}>
              <Icon name="directions-car" size={20} color="#0086D0" />
              <Text style={styles.propertyText}>
                Traction:{' '}
                <Text style={styles.propertyValue}>
                  {vehicle.typeTransmission}
                </Text>
              </Text>
            </View>
            <View style={styles.propertyItem}>
              <Icon
                name="airline-seat-recline-extra"
                size={20}
                color="#0086D0"
              />
              <Text style={styles.propertyText}>
                Doors:{' '}
                <Text style={styles.propertyValue}>{vehicle.NbPortes}</Text>
              </Text>
            </View>
            <View style={styles.propertyItem}>
              <Icon name="ac-unit" size={20} color="#0086D0" />
              <Text style={styles.propertyText}>
                Air Conditioning:{' '}
                <Text style={styles.propertyValue}>
                  {vehicle.climatisation ? 'Yes' : 'No'}
                </Text>
              </Text>
            </View>
            <View style={styles.propertyItem}>
              <Icon name="build" size={20} color="#0086D0" />
              <Text style={styles.propertyText}>
                Additional features:{' '}
                <Text style={styles.propertyValue}>
                  {vehicle.accessoiresOptionSupp}
                </Text>
              </Text>
            </View>
          </View>
          {vehicle.note > 0 && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" color={colors.yellow} size={SPACING * 2} />
              <Text style={styles.ratingText}>{vehicle.note}</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => navigation.navigate('Booking', {id: vehicle._id})}
            style={styles.rentButton}>
            <Text style={styles.rentButtonText}>Rent a Car</Text>
          </TouchableOpacity>
        </View>

        {/* Notes Section */}
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitleReviews}>Reviews</Text>
          {loadingNotes ? (
            <ActivityIndicator size="large" color={colors.green} />
          ) : notes.length > 0 ? (
            notes.map((note, index) => (
              <View key={index} style={styles.noteCard}>
                <View style={styles.noteHeader}>
                  <Image
                    source={{uri: note.idClient.image}}
                    style={styles.noteImage}
                  />
                  <View style={styles.noteAuthorContainer}>
                    <Text style={styles.noteAuthor}>
                      {`${note.idClient.nom} ${note.idClient.prenom}`}
                    </Text>
                    <Text style={styles.noteDate}>{note.created_at}</Text>
                  </View>
                  {renderStars(note.note)}
                </View>
                <Text style={styles.noteComment}>{note.commentaire || ''}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noNotesText}>No reviews yet.</Text>
          )}
        </View>
      </ScrollView>
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
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20, // Ensures content doesn't overlap at the bottom
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
    color: '#000',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
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
    color: '#000',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
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
    color: '#000',
  },
  properties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  propertyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '48%',
  },
  propertyText: {
    fontSize: 14,
    color: '#696969',
    marginLeft: 10,
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: colors['dark-gray'],
    marginLeft: SPACING / 2,
    fontWeight: 'bold',
    fontSize: 16,
  },
  notesSection: {
    marginTop: 20,
  },
  sectionTitleReviews: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 10,
  },
  noteCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors['dark-gray'],
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  noteImage: {
    width: 30,
    height: 30,
    borderRadius: 25,
    marginRight: 10,
  },
  noteAuthorContainer: {
    flex: 1,
  },
  noteAuthor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    marginTop: 5,
  },
  noteDate: {
    fontSize: 12,
    color: colors.gray,
  },
  noteRatingContainer: {
    flexDirection: 'row',
  },
  noteComment: {
    fontSize: 14,
    color: colors.black,
  },
  noReviewsText: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 10,
  },
});
