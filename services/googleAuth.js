import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { useEffect } from 'react';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './firebaseConfig';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleSignIn() {
  const redirectUri = makeRedirectUri({ useProxy: true });
  console.log('🔍 Redirect URI being used:', redirectUri); // ✅ Log it here

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '333617323157-nhhf6h6df8f4r9a2hu981vhgf781v58f.apps.googleusercontent.com',
    androidClientId: '333617323157-end2pjt8t30gn2dvikdokv7vcgc1v7sj.apps.googleusercontent.com',
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential);
    }
  }, [response]);

  return { promptAsync, request };
}