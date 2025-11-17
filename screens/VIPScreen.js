import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Animated,
  TextInput,
  Alert,        // ✅ Add this
  Modal             // ✅ If you're using a modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import CustomTabBar from '../components/CustomTabBar';
import { auth, db } from '../services/firebaseConfig'; // Adjust path if needed
import { collection, addDoc, getDocs} from 'firebase/firestore';
import LottieView from 'lottie-react-native';

export default function VIPScreen() {
  const navigation = useNavigation();
  const [vipPosts, setVipPosts] = useState([]); // No dummy data
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [showStickyText, setShowStickyText] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [dramaTitle, setDramaTitle] = useState('');
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('');
  const [rating, setRating] = useState('');
  const [tags, setTags] = useState('');


const fetchVipPosts = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'vipPosts'));
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setVipPosts(posts);
  } catch (error) {
    console.error('Error fetching VIP posts:', error);
  }
};

const handleSubmit = async () => {
  if (!dramaTitle || !content || !platform || !rating) {
    Alert.alert('Missing Fields', 'Please fill in all required fields.');
    return;
  }

  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    await addDoc(collection(db, 'vipPosts'), {
      dramaTitle,
      content,
      platform,
      rating: parseFloat(rating),
      tags: tags.split(',').map(tag => tag.trim()),
      uid,
      createdAt: new Date(),
    });

    Alert.alert('Post Created', 'Your thoughts have been shared!');
    setDramaTitle('');
    setContent('');
    setPlatform('');
    setRating('');
    setTags('');
    setShowModal(false);
    fetchVipPosts(); // Refresh list
  } catch (error) {
    console.error('Error creating post:', error);
    Alert.alert('Error', 'Could not create post. Try again later.');
  }
};

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 2000,
      delay: 1500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
  Animated.timing(fadeAnim, {
    toValue: 0,
    duration: 2000,
    delay: 1500,
    useNativeDriver: true,
  }).start(() => {
    setShowStickyText(true);
  });
}, []);

  return (
    
  <View style={styles.container}>
    <View style={styles.content}>
      {/* App Header with Clapboard */}
      <View style={styles.appHeader}>
        <Text style={styles.appName}>CineCloud</Text>
        <View style={styles.clapboardTag}>
        </View>
      </View>

      <Animated.View style={[styles.welcomeBlock, { opacity: fadeAnim }]}>
        <Text style={styles.title}>🎉 Welcome, VIP!</Text>
        <Text style={styles.subtitle}>
          Enjoy exclusive features and early access to premium content.
        </Text>
      </Animated.View>

      {showStickyText && (
        <View style={styles.stickyWrapper}>
          <Text style={styles.stickyText}>Your cinematic journey, your words.</Text>
        </View>
      )}

      <Pressable
        style={styles.createPostButton}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="create" size={20} color="#fff" />
        <Text style={styles.createPostText}>Write about your latest watch</Text>
      </Pressable>

      {/* MODAL */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📝 Share Your Thoughts</Text>

            <TextInput
              style={styles.input}
              placeholder="Drama Title"
              value={dramaTitle}
              onChangeText={setDramaTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Your Thoughts"
              value={content}
              onChangeText={setContent}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Platform (e.g., Netflix)"
              value={platform}
              onChangeText={setPlatform}
            />
            <TextInput
              style={styles.input}
              placeholder="Rating (1–10)"
              value={rating}
              onChangeText={setRating}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Tags (comma-separated)"
              value={tags}
              onChangeText={setTags}
            />

            <View style={styles.modalButtons}>
              <Pressable style={styles.submitButton} onPress={handleSubmit}>
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.submitText}>Share Post</Text>
              </Pressable>

              <Pressable style={styles.cancelButton} onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={20} color="#fff" />
                <Text style={styles.submitText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        data={vipPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.postList}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <Text style={styles.postTitle}>{item.dramaTitle}</Text>
            <Text style={styles.postContent}>{item.content}</Text>
            <Text style={styles.postTags}>{item.tags.join(', ')}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No posts yet. Be the first to share!</Text>
        }
      />
    </View>

    <CustomTabBar isVIP={true} />
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D0E8F2',
    padding: 20,
  },
  content: {
    flex: 1,
    paddingBottom: 60,
  },
  welcomeBlock: {
    marginTop: 50, // Push welcome message lower
  },
  stickyWrapper: {
  marginTop: 50, // bring it closer to the top
  alignItems: 'center',
},

stickyText: {
  fontSize: 30,
  color: '#007BFF',
  textAlign: 'center',
  fontFamily: 'Pacifico_400Regular',
  opacity: 0.9,
  marginBottom: 30,
},
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Pacifico_400Regular',
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  createPostButton: {
    flexDirection: 'row',
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  createPostText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  postList: {
    paddingBottom: 20,
  },
  postCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 5,
  },
  postContent: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  postTags: {
    fontSize: 12,
    color: '#7DAAC3',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContent: {
  backgroundColor: '#fff',
  padding: 20,
  borderRadius: 15,
  width: '90%',
  elevation: 5,
},
modalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#007BFF',
  marginBottom: 15,
  textAlign: 'center',
},
modalButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 10,
},
cancelButton: {
  flexDirection: 'row',
  backgroundColor: '#6c757d',
  padding: 10,
  borderRadius: 20,
  alignItems: 'center',
  justifyContent: 'center',
},
appHeader: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 20,
  marginBottom: 10,
},
appName: {
  fontSize: 24,
  color: '#007BFF',
  fontFamily: 'Pacifico_400Regular',
  marginRight: 10,
},
clapboardTag: {
  flexDirection: 'row',
  backgroundColor: '#007BFF',
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 15,
  alignItems: 'center',
},
clapboardText: {
  color: '#fff',
  marginLeft: 5,
  fontWeight: '600',
  fontSize: 14,
},
});