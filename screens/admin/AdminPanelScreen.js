import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    ScrollView, 
    ActivityIndicator,
    Switch,
    Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
    doc, 
    query, 
    where, 
    getDocs, 
    collection, 
    updateDoc, 
    onSnapshot,
    addDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../../services/firebaseConfig'; // Assuming your Firebase config is here

// --- Firestore Paths ---
const AUDIT_LOG_COLLECTION = 'auditLog';
const APP_CONFIG_DOC = doc(db, 'appData', 'config');

const AdminPanelScreen = () => {
    const navigation = useNavigation();
    const adminUserId = auth.currentUser?.uid;
    const adminEmail = auth.currentUser?.email;

    // User Management States
    const [searchEmail, setSearchEmail] = useState('');
    const [foundUser, setFoundUser] = useState(null);
    const [userSearchLoading, setUserSearchLoading] = useState(false);

    // Feature Flag States
    const [featureFlags, setFeatureFlags] = useState({});
    const [flagsLoading, setFlagsLoading] = useState(true);

    // Audit Log States
    const [auditLog, setAuditLog] = useState([]);
    const [logLoading, setLogLoading] = useState(true);

    // --- Core Admin Functions ---

    // 1. Audit Log Writer
    const logAdminAction = async (action, targetUserEmail = null, details = {}) => {
        if (!adminUserId) return;
        try {
            await addDoc(collection(db, AUDIT_LOG_COLLECTION), {
                timestamp: serverTimestamp(),
                adminId: adminUserId,
                adminEmail: adminEmail,
                action: action,
                targetUserEmail: targetUserEmail,
                details: details,
            });
        } catch (error) {
            console.error("Error writing audit log:", error);
        }
    };

    // 2. Fetch Feature Flags (Real-time listener)
    useEffect(() => {
        const unsubscribe = onSnapshot(APP_CONFIG_DOC, (docSnap) => {
            if (docSnap.exists()) {
                setFeatureFlags(docSnap.data().features || {});
            } else {
                setFeatureFlags({});
            }
            setFlagsLoading(false);
        }, (error) => {
            console.error("Error fetching feature flags:", error);
            setFlagsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 3. Fetch Audit Log (Real-time listener, limited to last 10)
    useEffect(() => {
        // Query to get the collection, relying on client-side sorting/filtering for simplicity
        const unsubscribe = onSnapshot(collection(db, AUDIT_LOG_COLLECTION), (snapshot) => {
            const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Sort client-side by timestamp descending
            logs.sort((a, b) => {
                // Handle cases where timestamp might be null (pending serverTimestamp)
                const timeA = a.timestamp?.toDate().getTime() || 0;
                const timeB = b.timestamp?.toDate().getTime() || 0;
                return timeB - timeA;
            }); 

            setAuditLog(logs.slice(0, 10)); // Display last 10 logs
            setLogLoading(false);
        }, (error) => {
            console.error("Error fetching audit log:", error);
            setLogLoading(false);
        });

        return () => unsubscribe();
    }, [adminUserId]);

    // --- User Management Logic ---

    const searchUserByEmail = async () => {
        if (!searchEmail) return;
        setFoundUser(null);
        setUserSearchLoading(true);

        try {
            // Query the 'users' collection where the 'email' field matches
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', searchEmail.toLowerCase().trim()));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                setFoundUser({ id: userDoc.id, ...userDoc.data() });
                await logAdminAction('SEARCH_USER', searchEmail);
            } else {
                Alert.alert("User Not Found", `No user found with email: ${searchEmail}`);
                await logAdminAction('SEARCH_USER_FAILED', searchEmail, { reason: 'User not found' });
            }
        } catch (error) {
            console.error("User search error:", error);
            Alert.alert("Error", "Failed to search user. Check console for details.");
        } finally {
            setUserSearchLoading(false);
        }
    };

    const togglePremiumStatus = async (userId, currentStatus) => {
        const newStatus = !currentStatus;
        const userDocRef = doc(db, 'users', userId);

        try {
            await updateDoc(userDocRef, {
                premium: newStatus // Note: Using 'premium' to match common database fields
            });
            
            // Update local state and log action
            setFoundUser(prev => ({ ...prev, premium: newStatus }));
            await logAdminAction(
                newStatus ? 'GRANT_PREMIUM' : 'REVOKE_PREMIUM', 
                foundUser.email, 
                { newStatus: newStatus }
            );

            Alert.alert("Success", `User ${foundUser.email} premium status updated to ${newStatus}.`);
        } catch (error) {
            console.error("Failed to update premium status:", error);
            Alert.alert("Error", "Failed to update user status in Firestore.");
        }
    };

    // --- Feature Flag Management Logic ---

    const handleFeatureFlagToggle = async (key, value) => {
        const newFlags = { ...featureFlags, [key]: value };

        try {
            await updateDoc(APP_CONFIG_DOC, { features: newFlags });
            
            await logAdminAction('TOGGLE_FEATURE_FLAG', null, { 
                flag: key, 
                newValue: value 
            });

            // State update is handled by the real-time listener (onSnapshot)
        } catch (error) {
            console.error("Failed to update feature flag:", error);
            Alert.alert("Error", "Failed to update feature flag in Firestore.");
        }
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigation.replace('AdminAuth'); // Navigate back to the admin login
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    // --- Render Components ---

    const renderAuditLog = (log) => {
        // Ensure timestamp is a Date object if it exists
        const timestampDate = log.timestamp?.toDate ? log.timestamp.toDate() : null;

        return (
            <View key={log.id} style={styles.logItem}>
                <Text style={styles.logText}>
                    <Text style={{ fontWeight: 'bold', color: '#FFD700' }}>{log.action}: </Text>
                    {log.targetUserEmail && `User: ${log.targetUserEmail}. `}
                    {log.details.flag && `Flag: ${log.details.flag} -> ${log.details.newValue}. `}
                </Text>
                <Text style={styles.logTimestamp}>
                    {timestampDate ? timestampDate.toLocaleString() : 'Loading...'}
                </Text>
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Master Admin Panel</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>Logged in as: {adminEmail}</Text>

            {/* --- 1. Search User & Premium Toggle --- */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Search User & Toggle Premium</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Search User by Email"
                    placeholderTextColor="#A0A0A0"
                    value={searchEmail}
                    onChangeText={setSearchEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={searchUserByEmail}
                    disabled={userSearchLoading}
                >
                    {userSearchLoading ? (
                        <ActivityIndicator color="#1C1C2B" />
                    ) : (
                        <Text style={styles.buttonText}>Search User</Text>
                    )}
                </TouchableOpacity>

                {foundUser && (
                    <View style={styles.userCard}>
                        <Text style={styles.userText}>ID: {foundUser.id}</Text>
                        <Text style={styles.userText}>Email: {foundUser.email}</Text>
                        <View style={styles.toggleRow}>
                            <Text style={styles.userText}>Premium Status:</Text>
                            <Switch
                                trackColor={{ false: "#767577", true: "#FFD700" }}
                                thumbColor={foundUser.premium ? "#FFD700" : "#f4f3f4"}
                                onValueChange={() => togglePremiumStatus(foundUser.id, foundUser.premium)}
                                value={!!foundUser.premium}
                            />
                            <Text style={styles.userPremiumText}>
                                {foundUser.premium ? 'Premium' : 'Standard'}
                            </Text>
                        </View>
                    </View>
                )}
            </View>

            {/* --- 2. Feature Flags Management --- */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Manage Feature Flags</Text>
                {flagsLoading ? (
                    <ActivityIndicator size="small" color="#FFD700" />
                ) : (
                    Object.keys(featureFlags).map(key => (
                        <View key={key} style={styles.flagRow}>
                            <Text style={styles.flagLabel}>{key}:</Text>
                            <Switch
                                trackColor={{ false: "#767577", true: "#FFD700" }}
                                thumbColor={featureFlags[key] ? "#FFD700" : "#f4f3f4"}
                                onValueChange={(value) => handleFeatureFlagToggle(key, value)}
                                value={featureFlags[key]}
                            />
                            <Text style={styles.flagStatus}>
                                {featureFlags[key] ? 'Enabled' : 'Disabled'}
                            </Text>
                        </View>
                    ))
                )}
            </View>

            {/* --- 3. Audit Log --- */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Audit Log (Last 10 Actions)</Text>
                {logLoading ? (
                    <ActivityIndicator size="small" color="#FFD700" />
                ) : (
                    <View style={styles.logList}>
                        {auditLog.map(renderAuditLog)}
                    </View>
                )}
            </View>
            <View style={{ height: 50 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1C1C2B',
        padding: 15,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 40,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700',
    },
    subtitle: {
        fontSize: 14,
        color: '#C0C0C0',
        marginBottom: 20,
    },
    logoutButton: {
        backgroundColor: '#E91E63',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
    logoutText: {
        color: 'white',
        fontWeight: 'bold',
    },
    section: {
        backgroundColor: '#2A2A40',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#3A3A50',
        paddingBottom: 5,
    },
    input: {
        backgroundColor: '#3A3A50',
        color: 'white',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
    },
    actionButton: {
        backgroundColor: '#FFD700',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#1C1C2B',
        fontSize: 16,
        fontWeight: 'bold',
    },
    userCard: {
        marginTop: 15,
        padding: 15,
        backgroundColor: '#3A3A50',
        borderRadius: 8,
    },
    userText: {
        color: 'white',
        fontSize: 15,
        marginBottom: 5,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: 10,
    },
    userPremiumText: {
        color: '#FFD700',
        fontSize: 15,
        marginLeft: 10,
    },
    flagRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#3A3A50',
    },
    flagLabel: {
        color: 'white',
        fontSize: 15,
        flex: 1,
    },
    flagStatus: {
        color: '#FFD700',
        fontSize: 15,
        width: 80,
        textAlign: 'right',
    },
    logList: {
        marginTop: 10,
    },
    logItem: {
        backgroundColor: '#3A3A50',
        padding: 10,
        borderRadius: 5,
        marginBottom: 8,
    },
    logText: {
        color: '#E0E0E0',
        fontSize: 13,
    },
    logTimestamp: {
        color: '#A0A0A0',
        fontSize: 10,
        marginTop: 5,
        textAlign: 'right',
    },
});

export default AdminPanelScreen;