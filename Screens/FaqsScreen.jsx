import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, LayoutAnimation, StyleSheet } from 'react-native';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_URL } from 'react-native-dotenv';
import Config from 'react-native-config'; 

const FaqsScreen = () => {
    const [faqs, setFaqs] = useState([]);
    const [openIndexes, setOpenIndexes] = useState([]);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const response = await axios.get(`${Config.API_URL}/faq`);
                setFaqs(response.data);
            } catch (error) {
                console.error('Error fetching FAQs:', error);
            }
        };

        fetchFaqs();
    }, []);

    const toggleFaq = (index) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpenIndexes((prev) =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.appContainer}>
            <Text style={styles.mainHeading}>FAQs</Text>
            {faqs.map((faq, index) => (
                <View key={index} style={styles.faqCard}>
                    <TouchableOpacity onPress={() => toggleFaq(index)} style={styles.faqHeader}>
                        <Text style={styles.question}>{faq.question}</Text>
                        <Ionicons
                            name={openIndexes.includes(index) ? 'chevron-up-outline' : 'chevron-down-outline'}
                            size={24}
                            color="#1ECB15"
                        />
                    </TouchableOpacity>
                    {openIndexes.includes(index) && (
                        <View style={styles.answerContainer}>
                            <Text style={styles.answer}>{faq.answer}</Text>
                        </View>
                    )}
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    appContainer: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f0f0f0',
    },
    mainHeading: {
        color: '#30B21A',
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
    },
    faqCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        elevation: 3, // for Android shadow
        shadowColor: '#000', // for iOS shadow
        shadowOffset: { width: 0, height: 2 }, // for iOS shadow
        shadowOpacity: 0.2, // for iOS shadow
        shadowRadius: 4, // for iOS shadow
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    question: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    answerContainer: {
        paddingTop: 10,
        paddingLeft: 5,
    },
    answer: {
        fontSize: 16,
        color: '#555',
    },
});

export default FaqsScreen;
