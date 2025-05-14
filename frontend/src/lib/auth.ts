// src/lib/auth.ts or similar
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../firebase';

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();

  try {
    // This is where the magic happens!
    const result = await signInWithPopup(auth, provider);
    // The signed-in user info is in result.user
    // You can get the Google ID Token and Access Token too
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    // The signed-in user info.
    const user = result.user;
    console.log("Successfully signed in with Google", user);
    // You might want to do something with the user object or redirect
  } catch (error: any) {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData?.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);

    console.error("Error signing in with Google:", errorMessage, errorCode);
    // ... display an error message to the user ...
  }
}

export async function signOutUser() {
    try {
        await signOut(auth);
        console.log("User signed out");
        // ... update your UI to reflect signed out state ...
    } catch (error) {
        console.error("Error signing out:", error);
    }
}
