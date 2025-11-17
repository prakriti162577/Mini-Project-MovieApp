import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebaseConfig'; // Assuming your Firebase config is here

const AdminAuthScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const handleAdminLogin = async () => {
        if (!email || !password) {
            Alert.alert("Login Error", "Please enter both email and password.");
            return;
        }

        setLoading(true);

        try {
            // 1. Sign in with Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Check Firestore for Admin flag
            const userDocRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists() && docSnap.data().isAdmin) {
                // Successful Admin Login
                navigation.replace('AdminPanel'); 
            } else {
                // Authentication successful, but user is not an Admin
                Alert.alert("Access Denied", "Your account is not authorized as a Master Admin.");
                await auth.signOut(); // Log them out immediately
            }
        } catch (error) {
            console.error("Admin Login Failed:", error);
            Alert.alert("Login Failed", "Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Master Admin Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Admin Email"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#A0A0A0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            
            <TouchableOpacity 
                style={styles.button} 
                onPress={handleAdminLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#1C1C2B" />
                ) : (
                    <Text style={styles.buttonText}>Log In</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.signOutButton} 
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.signOutButtonText}>Go Back to App</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1C1C2B',
        justifyContent: 'center',
        padding: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 40,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#2A2A40',
        color: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#FFD700',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: '#1C1C2B',
        fontSize: 18,
        fontWeight: 'bold',
    },
    signOutButton: {
        padding: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    signOutButtonText: {
        color: '#C0C0C0',
        fontSize: 14,
    },
});

export default AdminAuthScreen;