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
  TextInput,
  Modal,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {API_URL} from 'react-native-dotenv';
import Config from 'react-native-config';

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
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [hasRated, setHasRated] = useState(false);
  const [refreshNotes, setRefreshNotes] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updatedRating, setUpdatedRating] = useState('');
  const [updatedComment, setUpdatedComment] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);

  const {id} = route.params;

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await axios.get(`${Config.API_URL}/cars/${id}`);
        // Copier les données du véhicule pour manipulation
        let vehicleData = response.data;

        // Vérification et remplacement des URLs des images
        if (
          vehicleData.image &&
          vehicleData.image.includes('http://localhost:3001')
        ) {
          vehicleData.image = vehicleData.image.replace(
            'http://localhost:3001',
            'http://10.0.2.2:3001',
          );
        }
        if (
          vehicleData.image2 &&
          vehicleData.image2.includes('http://localhost:3001')
        ) {
          vehicleData.image2 = vehicleData.image2.replace(
            'http://localhost:3001',
            'http://10.0.2.2:3001',
          );
        }
        if (
          vehicleData.image3 &&
          vehicleData.image3.includes('http://localhost:3001')
        ) {
          vehicleData.image3 = vehicleData.image3.replace(
            'http://localhost:3001',
            'http://10.0.2.2:3001',
          );
        }
        if (
          vehicleData.image4 &&
          vehicleData.image4.includes('http://localhost:3001')
        ) {
          vehicleData.image4 = vehicleData.image4.replace(
            'http://localhost:3001',
            'http://10.0.2.2:3001',
          );
        }

        // Mise à jour de l'état avec les données du véhicule et les URLs corrigées
        setVehicle(vehicleData);
      } catch (error) {
        console.error('Error fetching vehicle data:', error);
      }
    };
    fetchVehicle();
  }, [id]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        if (id) {
          const userId = await AsyncStorage.getItem('userId');
          const response = await axios.get(`${Config.API_URL}/notes/car/${id}`);
          setNotes(response.data);

          // Check if the user has already rated this car
          const userHasRated = response.data.some(
            note => note.idClient._id === userId,
          );
          setHasRated(userHasRated);

          setLoadingNotes(false);
        }
      } catch (error) {
        console.error('There was an error fetching the notes!', error);
        setLoadingNotes(false);
      }
    };

    fetchNotes();
  }, [id, refreshNotes]);

  const handleRatingSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');

      const submitResponse = await axios.post(
        `${Config.API_URL}/notes`,
        {
          idClient: userId,
          idVoiture: id,
          note: rating,
          commentaire: comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (submitResponse.status === 201) {
        alert('Rating submitted successfully');
        setShowRatingForm(false);
        setHasRated(true);
        setRating('');
        setComment('');
        setRefreshNotes(prev => !prev); // Toggle the refresh state to trigger notes re-fetch
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      if (error.response && error.response.status === 400) {
        alert('You have already submitted a rating for this car.');
      } else {
        alert(
          'An error occurred while submitting your rating. Please try again.',
        );
      }
    }
  };
  const handleDelete = async noteId => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.delete(`${Config.API_URL}/notes/${noteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Review deleted successfully');
      setRefreshNotes(prev => !prev); // Refresh notes after deletion
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete review');
    }
  };
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };
    getUserId();
  }, []);

  const handleUpdateSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(
        `${Config.API_URL}/notes/${selectedNote._id}`,
        {
          note: updatedRating,
          commentaire: updatedComment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      alert('Review updated successfully');
      setShowUpdateForm(false);
      setRefreshNotes(prev => !prev); // Refresh notes after update
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update review');
    }
  };

  const handleRatingInput = (text, isUpdate = false) => {
    const numericValue = text.replace(',', '.'); // Remplacer la virgule par un point
    const regex = /^\d*(\.\d{0,2})?$/; // Permet jusqu'à deux chiffres après le point

    if (regex.test(numericValue)) {
      if (isUpdate) {
        setUpdatedRating(numericValue);
      } else {
        setRating(numericValue);
      }
    }
  };

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
          <Text style={{display: 'none'}}></Text>
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
          <View style={styles.ratingAndButtonContainer}>
            {vehicle.note > 0 && (
              <View style={styles.ratingContainer}>
                <Ionicons
                  name="star"
                  color={colors.yellow}
                  size={SPACING * 2}
                />
                <Text style={styles.ratingText}>{vehicle.note.toFixed(2)}</Text>
              </View>
            )}
            {!hasRated && (
              <TouchableOpacity
                style={styles.addRateButton}
                onPress={() => setShowRatingForm(true)}>
                <Text style={styles.addRateButtonText}>Add Your Rate</Text>
              </TouchableOpacity>
            )}
          </View>
          <Modal
            transparent={true}
            visible={showRatingForm}
            animationType="fade"
            onRequestClose={() => setShowRatingForm(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.formTitle}>Rate this car</Text>
                <View style={styles.ratingInputContainer}>
                  <Text style={styles.label}>Note / 5</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="0.00"
                    value={rating}
                    onChangeText={text => handleRatingInput(text)}
                  />
                </View>

                <View style={styles.commentInputContainer}>
                  <Text style={styles.label}>Comment</Text>
                  <TextInput
                    style={styles.commentInput}
                    value={comment}
                    onChangeText={setComment}
                    multiline
                  />
                </View>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleRatingSubmit}>
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowRatingForm(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
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
                    <Text style={styles.noteDate}>
                      {' '}
                      {new Date(note.created_at).toLocaleDateString('en-GB')}
                    </Text>
                  </View>
                  {renderStars(note.note)}
                </View>
                <Text style={styles.noteComment}>{note.commentaire || ''}</Text>
                {note.idClient._id === userId && (
                  <View style={styles.noteActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        setSelectedNote(note);
                        setUpdatedRating(note.note.toString());
                        setUpdatedComment(note.commentaire);
                        setShowUpdateForm(true);
                      }}>
                      <MaterialCommunityIcons
                        name="square-edit-outline"
                        size={20}
                        color={colors.green}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDelete(note._id)}>
                      <Ionicons name="trash-sharp" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noNotesText}>No reviews yet.</Text>
          )}
        </View>
        {showUpdateForm && (
          <Modal
            transparent={true}
            visible={showUpdateForm}
            animationType="fade"
            onRequestClose={() => setShowUpdateForm(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.formTitle}>Update your review</Text>
                <View style={styles.ratingInputContainer}>
                  <Text style={styles.label}>Rating / 5</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="0.00"
                    value={updatedRating}
                    onChangeText={text => handleRatingInput(text, true)}
                  />
                </View>

                <View style={styles.commentInputContainer}>
                  <Text style={styles.label}>Comment</Text>
                  <TextInput
                    style={styles.commentInput}
                    value={updatedComment}
                    onChangeText={setUpdatedComment}
                    multiline
                  />
                </View>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleUpdateSubmit}>
                  <Text style={styles.submitButtonText}>Update</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowUpdateForm(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
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
  ratingAndButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  ratingInputContainer: {
    marginBottom: 15,
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  commentInputContainer: {
    marginBottom: 20,
    width: '100%',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#000',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  addRateButton: {
    backgroundColor: '#FFD700',
    borderRadius: 25,
    paddingVertical: 5,
    paddingHorizontal: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },

  addRateButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  noteActions: {
    flexDirection: 'row',
    marginTop: 'auto',
  },
  actionButton: {
    marginTop: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
    marginHorizontal: 5,
  },
});
