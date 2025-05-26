// src/lib/auth.ts
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../firebase';

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();

  provider.addScope('https://www.googleapis.com/auth/calendar.events');

  try {
    const result = await signInWithPopup(auth, provider);

    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    const user = result.user;
    console.log("Successfully signed in with Google", user);
    console.log("Access Token:", token);

    return { user, token };
  } catch (error: any) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error("Error signing in with Google:", errorMessage, errorCode);
  }
}

export async function signOutUser() {
    try {
        await signOut(auth);
        console.log("User signed out");
    } catch (error) {
        console.error("Error signing out:", error);
    }
}
