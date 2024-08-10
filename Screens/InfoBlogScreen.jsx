import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, } from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const backIcon = require('../assets/left-arrow.png');
const dotsIcon = require('../assets/dots.png');
const InfoBlogScreen = ({navigation}) => {
  const route = useRoute();
  const { id: blogId } = route.params;
  
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`http://192.168.1.185:3001/blogs/${blogId}`);
        setBlog(response.data);
      } catch (err) {
        setError('Failed to fetch blog details');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0086D0" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
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
      <Text style={styles.title}>{blog.title}</Text>
      <Image source={{ uri: blog.image }} style={styles.image} />
      <Text style={styles.meta}>{blog.author} · {new Date(blog.date).toLocaleDateString()}</Text>
      <Text style={styles.summary}>{blog.summary}</Text>
      <View style={styles.contentContainer}>
        {blog.content.map((section, index) => (
          <View key={index} style={styles.section}>
            {section.title && <Text style={styles.sectionTitle}>{section.title}</Text>}
            <Text style={styles.sectionText}>{section.text}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: '#eaeaea',
  },
  meta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  summary: {
    fontSize: 16,
    color: '#444',
    marginBottom: 24,
    lineHeight: 24,
    textAlign: 'justify',
  },
  contentContainer: {
    paddingHorizontal: 8,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0086D0',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    textAlign: 'justify',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
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
});

export default InfoBlogScreen;
