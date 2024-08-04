import React from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';

function HomeScreen(props) {
  console.log(props);
  return (
    <View style={styles.viewStyle}>
      <Text style={styles.headingStyle}>React Navigation</Text>
      <Text style={styles.textStyle}>This is home screen</Text>
      <Button
        title="Profile"
        onPress={() =>
          props.navigation.navigate('Profile', {
            name: 'ilhem',
          })
        }
      />
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
});

export default HomeScreen;
