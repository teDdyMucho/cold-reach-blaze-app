import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from './firebase';
import { Template, EmailComponent, UserSettings } from '@/types';

// Authentication services
export const registerUser = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    await updateProfile(userCredential.user, {
      displayName: displayName
    });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      displayName,
      createdAt: serverTimestamp(),
      settings: {
        theme: 'light',
        emailSignature: '',
        defaultFromName: displayName,
        defaultFromEmail: email
      }
    });
    
    return userCredential.user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

// Template services
export const saveTemplate = async (template: Template) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    const templateRef = template.id 
      ? doc(db, 'users', userId, 'templates', template.id)
      : doc(collection(db, 'users', userId, 'templates'));
    
    const templateData = {
      ...template,
      id: templateRef.id,
      updatedAt: serverTimestamp(),
      createdAt: template.createdAt || serverTimestamp()
    };
    
    await setDoc(templateRef, templateData);
    return templateRef.id;
  } catch (error) {
    console.error('Error saving template:', error);
    throw error;
  }
};

export const getTemplate = async (templateId: string) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    const templateRef = doc(db, 'users', userId, 'templates', templateId);
    const templateSnap = await getDoc(templateRef);
    
    if (templateSnap.exists()) {
      return { id: templateSnap.id, ...templateSnap.data() } as Template;
    } else {
      throw new Error('Template not found');
    }
  } catch (error) {
    console.error('Error getting template:', error);
    throw error;
  }
};

export const getUserTemplates = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    const templatesRef = collection(db, 'users', userId, 'templates');
    const q = query(templatesRef, orderBy('updatedAt', 'desc'));
    const templatesSnap = await getDocs(q);
    
    const templates: Template[] = [];
    templatesSnap.forEach((doc) => {
      templates.push({ id: doc.id, ...doc.data() } as Template);
    });
    
    return templates;
  } catch (error) {
    console.error('Error getting templates:', error);
    throw error;
  }
};

export const deleteTemplate = async (templateId: string) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    await deleteDoc(doc(db, 'users', userId, 'templates', templateId));
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
};

// Contact services
export const saveContact = async (contact: any) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    const contactRef = contact.id 
      ? doc(db, 'users', userId, 'contacts', contact.id)
      : doc(collection(db, 'users', userId, 'contacts'));
    
    const contactData = {
      ...contact,
      id: contactRef.id,
      updatedAt: serverTimestamp(),
      createdAt: contact.createdAt || serverTimestamp()
    };
    
    await setDoc(contactRef, contactData);
    return contactRef.id;
  } catch (error) {
    console.error('Error saving contact:', error);
    throw error;
  }
};

export const getContact = async (contactId: string) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    const contactRef = doc(db, 'users', userId, 'contacts', contactId);
    const contactSnap = await getDoc(contactRef);
    
    if (contactSnap.exists()) {
      return { id: contactSnap.id, ...contactSnap.data() };
    } else {
      throw new Error('Contact not found');
    }
  } catch (error) {
    console.error('Error getting contact:', error);
    throw error;
  }
};

export const getUserContacts = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    const contactsRef = collection(db, 'users', userId, 'contacts');
    const q = query(contactsRef, orderBy('updatedAt', 'desc'));
    const contactsSnap = await getDocs(q);
    
    const contacts: any[] = [];
    contactsSnap.forEach((doc) => {
      contacts.push({ id: doc.id, ...doc.data() });
    });
    
    return contacts;
  } catch (error) {
    console.error('Error getting contacts:', error);
    throw error;
  }
};

export const deleteContact = async (contactId: string) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    await deleteDoc(doc(db, 'users', userId, 'contacts', contactId));
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
};

// User settings services
export const updateUserSettings = async (settings: UserSettings) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    await updateDoc(doc(db, 'users', userId), {
      settings,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};

export const getUserSettings = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists() && userDoc.data().settings) {
      return userDoc.data().settings as UserSettings;
    } else {
      return {
        theme: 'light',
        emailSignature: '',
        defaultFromName: '',
        defaultFromEmail: ''
      } as UserSettings;
    }
  } catch (error) {
    console.error('Error getting user settings:', error);
    throw error;
  }
};

// Image upload service
export const uploadImage = async (file: File) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    const storageRef = ref(storage, `users/${userId}/images/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
