import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { getFirestore, collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import { Template, Campaign, Contact, EmailProvider, User } from "@/types";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Authentication functions
export const registerUser = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    return userCredential.user;
  } catch (error: any) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error("Error logging in user:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Error logging out:", error);
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

// Template functions
export const getUserTemplates = async (): Promise<Template[]> => {
  try {
    const db = getFirestore();
    const templatesCollection = collection(db, "templates");
    const templatesSnapshot = await getDocs(templatesCollection);
    
    const templatesList = templatesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Template[];
    
    return templatesList;
  } catch (error) {
    console.error("Error fetching templates:", error);
    throw error;
  }
};

export const getTemplateById = async (templateId: string): Promise<Template | null> => {
  try {
    const db = getFirestore();
    const templateDocRef = doc(db, "templates", templateId);
    const templateDocSnapshot = await getDoc(templateDocRef);
    
    if (templateDocSnapshot.exists()) {
      return {
        id: templateDocSnapshot.id,
        ...templateDocSnapshot.data(),
      } as Template;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching template:", error);
    throw error;
  }
};

export const saveTemplate = async (template: Template): Promise<Template> => {
  try {
    const db = getFirestore();
    const templatesCollection = collection(db, "templates");
    
    if (template.id) {
      // Update existing template
      const templateDocRef = doc(db, "templates", template.id);
      await updateDoc(templateDocRef, template);
      return template;
    } else {
      // Create new template
      const newDocRef = await addDoc(templatesCollection, template);
      return { ...template, id: newDocRef.id };
    }
  } catch (error) {
    console.error("Error saving template:", error);
    throw error;
  }
};

export const deleteTemplate = async (templateId: string): Promise<void> => {
  try {
    const db = getFirestore();
    const templateDocRef = doc(db, "templates", templateId);
    await deleteDoc(templateDocRef);
  } catch (error) {
    console.error("Error deleting template:", error);
    throw error;
  }
};

// Campaign functions
export const getUserCampaigns = async (): Promise<Campaign[]> => {
  try {
    const db = getFirestore();
    const campaignsCollection = collection(db, "campaigns");
    const campaignsSnapshot = await getDocs(campaignsCollection);
    
    const campaignsList = campaignsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Campaign[];
    
    return campaignsList;
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    throw error;
  }
};

export const getCampaignById = async (campaignId: string): Promise<Campaign | null> => {
  try {
    const db = getFirestore();
    const campaignDocRef = doc(db, "campaigns", campaignId);
    const campaignDocSnapshot = await getDoc(campaignDocRef);
    
    if (campaignDocSnapshot.exists()) {
      return {
        id: campaignDocSnapshot.id,
        ...campaignDocSnapshot.data(),
      } as Campaign;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching campaign:", error);
    throw error;
  }
};

export const saveCampaign = async (campaign: Campaign): Promise<void> => {
  try {
    const db = getFirestore();
    const campaignsCollection = collection(db, "campaigns");

    if (campaign.id) {
      // Update existing campaign
      const campaignDocRef = doc(db, "campaigns", campaign.id);
      await updateDoc(campaignDocRef, campaign);
    } else {
      // Create new campaign
      await addDoc(campaignsCollection, campaign);
    }
  } catch (error) {
    console.error("Error saving campaign:", error);
    throw error;
  }
};

export const deleteCampaign = async (campaignId: string): Promise<void> => {
  try {
    const db = getFirestore();
    const campaignDocRef = doc(db, "campaigns", campaignId);
    await deleteDoc(campaignDocRef);
  } catch (error) {
    console.error("Error deleting campaign:", error);
    throw error;
  }
};

// Contact functions
export const getUserContacts = async (): Promise<Contact[]> => {
  try {
    const db = getFirestore();
    const contactsCollection = collection(db, "contacts");
    const contactsSnapshot = await getDocs(contactsCollection);
    
    const contactsList = contactsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Contact[];
    
    return contactsList;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
};

export const getContactById = async (contactId: string): Promise<Contact | null> => {
  try {
    const db = getFirestore();
    const contactDocRef = doc(db, "contacts", contactId);
    const contactDocSnapshot = await getDoc(contactDocRef);
    
    if (contactDocSnapshot.exists()) {
      return {
        id: contactDocSnapshot.id,
        ...contactDocSnapshot.data(),
      } as Contact;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching contact:", error);
    throw error;
  }
};

// Fix the saveContact function
export const saveContact = async (contact: Partial<Contact>): Promise<Contact> => {
  try {
    const db = getFirestore();
    const contactsRef = collection(db, "contacts");
    
    // Add createdAt if it's a new contact
    const contactWithTimestamp = {
      ...contact,
      createdAt: contact.createdAt || new Date().toISOString(),
    };
    
    if (contact.id) {
      // Update existing contact
      const docRef = doc(db, "contacts", contact.id);
      await updateDoc(docRef, contactWithTimestamp);
      return { ...contactWithTimestamp, id: contact.id } as Contact;
    } else {
      // Create new contact
      const newDocRef = await addDoc(contactsRef, contactWithTimestamp);
      return { ...contactWithTimestamp, id: newDocRef.id } as Contact;
    }
  } catch (error) {
    console.error("Error saving contact:", error);
    throw error;
  }
};

export const deleteContact = async (contactId: string): Promise<void> => {
  try {
    const db = getFirestore();
    const contactDocRef = doc(db, "contacts", contactId);
    await deleteDoc(contactDocRef);
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
};

// Email Provider functions
export const getUserEmailProviders = async (): Promise<EmailProvider[]> => {
  try {
    const db = getFirestore();
    const emailProvidersCollection = collection(db, "emailProviders");
    const emailProvidersSnapshot = await getDocs(emailProvidersCollection);
    
    const emailProvidersList = emailProvidersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as EmailProvider[];
    
    return emailProvidersList;
  } catch (error) {
    console.error("Error fetching email providers:", error);
    throw error;
  }
};

export const getEmailProviderById = async (emailProviderId: string): Promise<EmailProvider | null> => {
  try {
    const db = getFirestore();
    const emailProviderDocRef = doc(db, "emailProviders", emailProviderId);
    const emailProviderDocSnapshot = await getDoc(emailProviderDocRef);
    
    if (emailProviderDocSnapshot.exists()) {
      return {
        id: emailProviderDocSnapshot.id,
        ...emailProviderDocSnapshot.data(),
      } as EmailProvider;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching email provider:", error);
    throw error;
  }
};

export const saveEmailProvider = async (emailProvider: EmailProvider): Promise<void> => {
  try {
    const db = getFirestore();
    const emailProvidersCollection = collection(db, "emailProviders");

    if (emailProvider.id) {
      // Update existing email provider
      const emailProviderDocRef = doc(db, "emailProviders", emailProvider.id);
      await updateDoc(emailProviderDocRef, emailProvider);
    } else {
      // Create new email provider
      await addDoc(emailProvidersCollection, emailProvider);
    }
  } catch (error) {
    console.error("Error saving email provider:", error);
    throw error;
  }
};

export const deleteEmailProvider = async (emailProviderId: string): Promise<void> => {
  try {
    const db = getFirestore();
    const emailProviderDocRef = doc(db, "emailProviders", emailProviderId);
    await deleteDoc(emailProviderDocRef);
  } catch (error) {
    console.error("Error deleting email provider:", error);
    throw error;
  }
};

// Storage functions (e.g., for images)
export const uploadImage = async (file: File, storagePath: string): Promise<string> => {
  try {
    const storageRef = ref(storage, `${storagePath}/${uuidv4()}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};
