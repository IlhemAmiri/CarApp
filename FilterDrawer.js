// FilterDrawer.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

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

const FilterDrawer = ({
  vehicleType,
  bodyType,
  seats,
  toggleVehicleType,
  toggleBodyType,
  toggleSeats,
  onClose,
}) => {
  const CheckBoxRow = ({children}) => (
    <View style={styles.checkboxRow}>{children}</View>
  );

  const CheckBox = ({label, value, onChange}) => (
    <TouchableOpacity onPress={onChange} style={styles.checkboxContainer}>
      <View style={[styles.checkbox, value && styles.checkboxChecked]}>
        {value && <Ionicons name="checkmark" size={14} color={colors.white} />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Filters</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={30} color={colors.black} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.filterTitle}>Vehicle Type</Text>
        <CheckBoxRow>
          <CheckBox
            label="Car"
            value={vehicleType.includes('Car')}
            onChange={() => toggleVehicleType('Car')}
          />
          <CheckBox
            label="Van"
            value={vehicleType.includes('Van')}
            onChange={() => toggleVehicleType('Van')}
          />
          <CheckBox
            label="Minibus"
            value={vehicleType.includes('Minibus')}
            onChange={() => toggleVehicleType('Minibus')}
          />
          <CheckBox
            label="Prestige"
            value={vehicleType.includes('Prestige')}
            onChange={() => toggleVehicleType('Prestige')}
          />
        </CheckBoxRow>
        <Text style={styles.filterTitle}>Body Type</Text>
        <CheckBoxRow>
          <CheckBox
            label="SUV"
            value={bodyType.includes('SUV')}
            onChange={() => toggleBodyType('SUV')}
          />
          <CheckBox
            label="Coupe"
            value={bodyType.includes('Coupe')}
            onChange={() => toggleBodyType('Coupe')}
          />
          <CheckBox
            label="Convertible"
            value={bodyType.includes('Convertible')}
            onChange={() => toggleBodyType('Convertible')}
          />
        </CheckBoxRow>
        <CheckBoxRow>
          <CheckBox
            label="Exotic Cars"
            value={bodyType.includes('Exotic Cars')}
            onChange={() => toggleBodyType('Exotic Cars')}
          />
          <CheckBox
            label="Hatchback"
            value={bodyType.includes('Hatchback')}
            onChange={() => toggleBodyType('Hatchback')}
          />
          <CheckBox
            label="Minivan"
            value={bodyType.includes('Minivan')}
            onChange={() => toggleBodyType('Minivan')}
          />
        </CheckBoxRow>
        <CheckBoxRow>
          <CheckBox
            label="Truck"
            value={bodyType.includes('Truck')}
            onChange={() => toggleBodyType('Truck')}
          />
          <CheckBox
            label="Compact"
            value={bodyType.includes('Compact')}
            onChange={() => toggleBodyType('Compact')}
          />
          <CheckBox
            label="Sedan"
            value={bodyType.includes('Sedan')}
            onChange={() => toggleBodyType('Sedan')}
          />
        </CheckBoxRow>
        <CheckBoxRow>
          <CheckBox
            label="Sports Car"
            value={bodyType.includes('Sports Car')}
            onChange={() => toggleBodyType('Sports Car')}
          />
          <CheckBox
            label="Station Wagon"
            value={bodyType.includes('Station Wagon')}
            onChange={() => toggleBodyType('Station Wagon')}
          />
        </CheckBoxRow>
        <Text style={styles.filterTitle}>Seats</Text>
        <CheckBoxRow>
          <CheckBox
            label="2 Seats"
            value={seats.includes(2)}
            onChange={() => toggleSeats(2)}
          />
          <CheckBox
            label="4 Seats"
            value={seats.includes(4)}
            onChange={() => toggleSeats(4)}
          />
          <CheckBox
            label="5 Seats"
            value={seats.includes(5)}
            onChange={() => toggleSeats(5)}
          />
          <CheckBox
            label="6 Seats"
            value={seats.includes(6)}
            onChange={() => toggleSeats(6)}
          />
        </CheckBoxRow>
        <CheckBoxRow>
          <CheckBox
            label="7 Seats"
            value={seats.includes(7)}
            onChange={() => toggleSeats(7)}
          />
        </CheckBoxRow>
        {/* Add more filters as needed */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    padding: SPACING,
    backgroundColor: colors.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING * 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
  },
  scrollView: {
    flex: 1,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SPACING * 3,
    color: colors.black,
  },
  checkboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING,
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.gray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING / 2,
  },
  checkboxChecked: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#000',
  },
});

export default FilterDrawer;
