import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

function UserScreen() {
  return (
    <View style={styles.viewStyle}>
      <Text style={styles.headingStyle}>React Navigation</Text>
      <Text style={styles.textStyle}>This is user screen</Text>
    </View>
  );
};

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

export default UserScreen;
