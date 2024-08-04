import React from 'react';
import {StyleSheet, Text, View, Button} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

function ProfileScreen(props) {
  const name = props.route.params?.name || 'Guest';
  console.log(props);

  return (
    <View style={styles.viewStyle}>
      <Text style={styles.headingStyle}>{name}</Text>
      <Icon name="person" size={50} color="#000" style={styles.iconStyle} />
      <Button title="User" onPress={() => props.navigation.navigate('User')} />
    </View>
  );
}

const styles = StyleSheet.create({
  viewStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  headingStyle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  textStyle: {
    fontSize: 16,
  },
  iconStyle: {
    marginBottom: 20,
  },
});

export default ProfileScreen;
