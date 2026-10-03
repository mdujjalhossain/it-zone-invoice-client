import {
    createUserWithEmailAndPassword,
    deleteUser,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { auth } from '../firebase.config';

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Register with email & password
    const createUser = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    // Login with email & password
    const signIn = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    // Update display name / photo, then refresh the user so the UI shows the new data immediately
    const updateUserProfile = (name, photo) => {
        if (!auth.currentUser) {
            return Promise.reject(new Error('No user logged in!'));
        }

        return updateProfile(auth.currentUser, {
            displayName: name,
            photoURL: photo
        }).then(() => {
            return auth.currentUser.reload().then(() => {
                setUser({ ...auth.currentUser });
            });
        });
    };

    const logOut = () => {
        return signOut(auth);
    };

    // Send the verification email (to the given user, or the current one)
    const verifyEmail = (currentUser) => {
        const targetUser = currentUser || auth.currentUser;
        if (!targetUser) return Promise.reject(new Error('No user available for verification!'));
        return sendEmailVerification(targetUser);
    };

    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    };

    // Fresh Firebase ID token, sent as "Authorization: Bearer <token>" to the protected API routes.
    // (Use this instead of user.getIdToken(): after updateUserProfile the stored user is a plain copy.)
    const getToken = () => {
        if (!auth.currentUser) return Promise.resolve(null);
        return auth.currentUser.getIdToken();
    };

    const deleteUserAccount = () => {
        const targetUser = auth.currentUser;
        if (!targetUser) {
            return Promise.reject(new Error('No user logged in!'));
        }
        return deleteUser(targetUser);
    };

    // Auth state observer
    useEffect(() => {
        const unSubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => {
            unSubscribe();
        };
    }, []);

    const authInfo = {
        createUser,
        signIn,
        logOut,
        updateUserProfile,
        verifyEmail,
        resetPassword,
        deleteUserAccount,
        getToken,
        user,
        loading
    };

    return <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>;
};

export default AuthProvider;