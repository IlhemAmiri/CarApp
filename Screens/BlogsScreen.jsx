import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SPACING = 10;
const colors = {
  'dark-gray': '#1E2126',
  black: '#000',
  light: '#FFF',
  primary: '#0086D0',
};

const BlogsScreen = () => {
  const [blogs, setBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const blogsPerPage = 6;
  const navigation = useNavigation();

  useEffect(() => {
    const fetchBlogs = async (page) => {
      try {
        const res = await axios.get(`http://192.168.1.185:3001/blogs?page=${page}&limit=${blogsPerPage}`);
        setBlogs(res.data.data);
        setTotalPages(Math.ceil(res.data.total / blogsPerPage));
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
      }
    };

    fetchBlogs(currentPage);
  }, [currentPage]);

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.blogsContainer}>
        {blogs.map((blog) => (
          <View key={blog._id} style={styles.card}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: blog.image }} style={styles.image} />
              <LinearGradient
                colors={['rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0)']}
                style={styles.imageGradient}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.category}>{blog.category}</Text>
              <Text style={styles.dateAuthor}>
                {blog.author} · {formatDate(blog.date)}
              </Text>
              <Text style={styles.titleBlog}>{blog.title}</Text>
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('InfoBlog', { id: blog._id })}
            >
              <LinearGradient
                style={styles.gradient}
                colors={['#1ECB15', colors.black]}
              >
                <Ionicons
                  name="arrow-forward"
                  size={SPACING * 2}
                  color={colors.light}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
          onPress={handlePreviousPage}
          disabled={currentPage === 1}
        >
          <Text style={[styles.paginationText, currentPage === 1 && styles.disabledText]}>Previous</Text>
        </TouchableOpacity>
        <Text style={styles.pageInfo}>
          Page {currentPage} of {totalPages}
        </Text>
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
          onPress={handleNextPage}
          disabled={currentPage === totalPages}
        >
          <Text style={[styles.paginationText, currentPage === totalPages && styles.disabledText]}>Next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: SPACING,
  },
  blogsContainer: {
    paddingTop: 50,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: colors.light,
    borderRadius: SPACING * 2,
    marginBottom: SPACING * 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    position: 'relative', // Positioning relative to align the arrow
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: SPACING * 2,
    borderTopRightRadius: SPACING * 2,
  },
  imageGradient: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: SPACING * 2,
    borderTopRightRadius: SPACING * 2,
  },
  textContainer: {
    padding: SPACING,
    paddingBottom: SPACING * 5, 
  },
  category: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007C00',
    marginBottom: SPACING / 2,
  },
  dateAuthor: {
    fontSize: 12,
    color: '#666',
    marginBottom: SPACING,
  },
  titleBlog: {
    fontSize: 18,
    fontWeight: '700',
    color: colors['dark-gray'],
    marginBottom: SPACING,
  },
  button: {
    position: 'absolute',
    bottom: SPACING,
    right: SPACING,
    borderRadius: SPACING,
    overflow: 'hidden',
  },
  gradient: {
    padding: SPACING / 2,
    paddingHorizontal: SPACING,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING * 3,
  },
  paginationButton: {
    paddingHorizontal: SPACING * 2,
    paddingVertical: SPACING / 2,
    backgroundColor: "#000",
    borderRadius: SPACING,
  },
  paginationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.light,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  disabledText: {
    color: '#999',
  },
  pageInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors['dark-gray'],
  },
});

export default BlogsScreen;
