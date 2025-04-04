import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { getFirestore, collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, setDoc, serverTimestamp, writeBatch, increment } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import { Template, Campaign, Contact, EmailProvider, User, ContactGroup } from "@/types";
import app, { db, auth, storage } from './firebase';

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
    // Get current user
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error("No authenticated user found");
    }
    
    // Use the nested collection structure /users/{userId}/templates
    const templatesCollection = collection(db, "users", currentUser.uid, "templates");
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

// Get public templates from all users
export const getPublicTemplates = async (): Promise<Template[]> => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error("No authenticated user found");
    }
    
    // Create an array to store all public templates
    let allPublicTemplates: Template[] = [];
    
    // Query all users
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);
    
    // For each user, get their public templates
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const templatesCollection = collection(db, "users", userId, "templates");
      
      // Query only public templates
      const q = query(templatesCollection, where("isPublic", "==", true));
      const templatesSnapshot = await getDocs(q);
      
      const userPublicTemplates = templatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Template[];
      
      allPublicTemplates = [...allPublicTemplates, ...userPublicTemplates];
    }
    
    return allPublicTemplates;
  } catch (error) {
    console.error("Error fetching public templates:", error);
    throw error;
  }
};

export const getTemplateById = async (templateId: string): Promise<Template | null> => {
  try {
    // Get current user
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error("No authenticated user found");
    }
    
    const templateDocRef = doc(db, "users", currentUser.uid, "templates", templateId);
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

export const getTemplate = getTemplateById;

export const saveTemplate = async (template: Partial<Template>): Promise<string> => {
  try {
    // Get current user
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error("No authenticated user found");
    }
    
    // Use the nested collection structure /users/{userId}/templates
    const templatesCollection = collection(db, "users", currentUser.uid, "templates");
    
    // Add user ID and timestamps
    const now = new Date().toISOString();
    const templateWithMetadata = { 
      ...template,
      userId: currentUser.uid,
      creatorName: currentUser.displayName || 'Unknown User',
      updatedAt: now,
      isPublic: template.isPublic !== undefined ? template.isPublic : false
    };
    
    // If it's a new template, add createdAt
    if (!template.id) {
      templateWithMetadata.createdAt = now;
    }
    
    if (template.id) {
      // Check if the document exists before updating
      const templateDocRef = doc(db, "users", currentUser.uid, "templates", template.id);
      const docSnapshot = await getDoc(templateDocRef);
      
      if (docSnapshot.exists()) {
        // Update existing template
        await updateDoc(templateDocRef, templateWithMetadata);
      } else {
        // Document doesn't exist, create it instead
        await setDoc(templateDocRef, {
          ...templateWithMetadata,
          createdAt: now // Ensure createdAt is set for new documents
        });
      }
      
      return template.id;
    } else {
      // Create new template
      const newDocRef = await addDoc(templatesCollection, templateWithMetadata);
      return newDocRef.id;
    }
  } catch (error) {
    console.error("Error saving template:", error);
    throw error;
  }
};

export const deleteTemplate = async (templateId: string): Promise<void> => {
  try {
    // Get current user
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error("No authenticated user found");
    }
    
    const templateDocRef = doc(db, "users", currentUser.uid, "templates", templateId);
    await deleteDoc(templateDocRef);
  } catch (error) {
    console.error("Error deleting template:", error);
    throw error;
  }
};

// Campaign functions
export const getUserCampaigns = async (): Promise<Campaign[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No authenticated user found");
    }

    const campaignsCollection = collection(db, "users", currentUser.uid, "campaigns");
    const campaignsSnapshot = await getDocs(campaignsCollection);
    
    const campaigns: Campaign[] = [];
    campaignsSnapshot.forEach((doc) => {
      campaigns.push({ id: doc.id, ...doc.data() } as Campaign);
    });
    
    // Sort campaigns by creation date (newest first)
    return campaigns.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    throw error;
  }
};

export const getCampaignById = async (campaignId: string): Promise<Campaign | null> => {
  try {
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

export const getCampaign = async (campaignId: string): Promise<Campaign | null> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No authenticated user found");
    }

    const campaignDocRef = doc(db, "users", currentUser.uid, "campaigns", campaignId);
    const campaignSnapshot = await getDoc(campaignDocRef);
    
    if (campaignSnapshot.exists()) {
      return {
        id: campaignSnapshot.id,
        ...campaignSnapshot.data()
      } as Campaign;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching campaign:", error);
    throw error;
  }
};

export const saveCampaign = async (campaign: Partial<Campaign>): Promise<string> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No authenticated user found");
    }
    
    // Use the correct path structure for campaigns
    const campaignRef = campaign.id 
      ? doc(db, "users", currentUser.uid, "campaigns", campaign.id)
      : doc(collection(db, "users", currentUser.uid, "campaigns"));
    
    // Ensure all required fields are present
    const campaignData = {
      ...campaign,
      id: campaignRef.id,
      updatedAt: serverTimestamp(),
      userId: currentUser.uid
    };
    
    // Save the campaign document
    await setDoc(campaignRef, campaignData);
    console.log(`Campaign saved successfully at /users/${currentUser.uid}/campaigns/${campaignRef.id}`);
    return campaignRef.id;
  } catch (error) {
    console.error("Error saving campaign:", error);
    throw error;
  }
};

export const deleteCampaign = async (campaignId: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No authenticated user found");
    }

    const campaignDocRef = doc(db, "users", currentUser.uid, "campaigns", campaignId);
    await deleteDoc(campaignDocRef);
  } catch (error) {
    console.error("Error deleting campaign:", error);
    throw error;
  }
};

// Contact functions
export const getUserContacts = async (): Promise<Contact[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No authenticated user found");
    }

    const contactsCollection = collection(db, "users", currentUser.uid, "contacts");
    const contactsSnapshot = await getDocs(contactsCollection);
    
    const contacts: Contact[] = [];
    contactsSnapshot.forEach((doc) => {
      contacts.push({ id: doc.id, ...doc.data() } as Contact);
    });
    
    return contacts;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
};

export const getUserContactLists = async (): Promise<{id: string, name: string, count: number}[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No authenticated user found");
    }

    const listsCollection = collection(db, "users", currentUser.uid, "contactLists");
    const listsSnapshot = await getDocs(listsCollection);
    
    const lists: {id: string, name: string, count: number}[] = [];
    listsSnapshot.forEach((doc) => {
      const data = doc.data();
      lists.push({ 
        id: doc.id, 
        name: data.name || "Unnamed List", 
        count: data.contactIds?.length || 0 
      });
    });
    
    return lists;
  } catch (error) {
    console.error("Error fetching contact lists:", error);
    throw error;
  }
};

export const getContactListById = async (listId: string): Promise<{id: string, name: string, contacts: Contact[]}> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No authenticated user found");
    }

    const listDocRef = doc(db, "users", currentUser.uid, "contactLists", listId);
    const listSnapshot = await getDoc(listDocRef);
    
    if (!listSnapshot.exists()) {
      throw new Error("Contact list not found");
    }
    
    const listData = listSnapshot.data();
    const contactIds = listData.contactIds || [];
    
    const contacts: Contact[] = [];
    
    // If there are contact IDs, fetch the actual contact documents
    if (contactIds.length > 0) {
      for (const contactId of contactIds) {
        const contactDocRef = doc(db, "users", currentUser.uid, "contacts", contactId);
        const contactSnapshot = await getDoc(contactDocRef);
        
        if (contactSnapshot.exists()) {
          contacts.push({ id: contactSnapshot.id, ...contactSnapshot.data() } as Contact);
        }
      }
    }
    
    return {
      id: listSnapshot.id,
      name: listData.name || "Unnamed List",
      contacts
    };
  } catch (error) {
    console.error("Error fetching contact list:", error);
    throw error;
  }
};

export const getContactById = async (contactId: string): Promise<Contact | null> => {
  try {
    // Get current user
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error("No authenticated user found");
    }
    
    const contactDocRef = doc(db, "users", currentUser.uid, "contacts", contactId);
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

export const createContactList = async (name: string, contactIds: string[]): Promise<string> => {
  try {
    console.log("Starting createContactList with:", { name, contactIdsCount: contactIds.length });
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("No authenticated user found");
      throw new Error("No authenticated user found");
    }
    
    // Create a direct path to the contactLists collection
    const userId = currentUser.uid;
    
    // Get contact details to validate emails
    const validContactIds: string[] = [];
    
    // First create the list with just the name and basic info
    const newListData = {
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: userId,
      contactIds: [], // Start with empty array, will update after validation
      contactCount: 0
    };
    
    // Add the document to Firestore - using proper collection() format
    const listsCollectionRef = collection(db, "users", userId, "contactLists");
    const newListRef = await addDoc(listsCollectionRef, newListData);
    const newListId = newListRef.id;
    
    console.log("Created initial contact list with ID:", newListId);
    
    // Now validate and process contacts one by one
    if (contactIds.length > 0) {
      for (const contactId of contactIds) {
        try {
          // Create a direct path to each contact - using proper doc() format
          const contactDocRef = doc(db, "users", userId, "contacts", contactId);
          
          const contactSnap = await getDoc(contactDocRef);
          if (contactSnap.exists()) {
            const contactData = contactSnap.data();
            if (contactData.email) {
              validContactIds.push(contactId);
            }
          }
        } catch (contactError) {
          console.error("Error checking contact:", contactId, contactError);
          // Continue with other contacts even if one fails
        }
      }
      
      // Update the list with valid contact IDs
      if (validContactIds.length > 0) {
        const listDocRef = doc(db, "users", userId, "contactLists", newListId);
        
        await updateDoc(listDocRef, {
          contactIds: validContactIds,
          contactCount: validContactIds.length,
          updatedAt: new Date().toISOString()
        });
        
        console.log("Updated contact list with valid contacts:", validContactIds.length);
      } else {
        console.log("No valid contacts with emails found");
      }
    }
    
    return newListId;
  } catch (error) {
    console.error("Error creating contact list:", error);
    throw error;
  }
};

export const saveContact = async (contact: Partial<Contact>): Promise<Contact> => {
  try {
    // Get current user
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error("No authenticated user found");
    }
    
    // Use the nested collection structure /users/{userId}/contacts
    const contactsRef = collection(db, "users", currentUser.uid, "contacts");
    
    // Add createdAt if it's a new contact
    const contactWithTimestamp = {
      ...contact,
      updatedAt: new Date().toISOString(),
    };
    
    if (!contact.id) {
      contactWithTimestamp.createdAt = new Date().toISOString();
      
      // Create new contact
      const docRef = await addDoc(contactsRef, contactWithTimestamp);
      return { ...contactWithTimestamp, id: docRef.id } as Contact;
    } else {
      // Update existing contact
      const contactDocRef = doc(db, "users", currentUser.uid, "contacts", contact.id);
      await updateDoc(contactDocRef, contactWithTimestamp);
      return { ...contactWithTimestamp, id: contact.id } as Contact;
    }
  } catch (error) {
    console.error("Error saving contact:", error);
    throw error;
  }
};

export const deleteContact = async (contactId: string): Promise<void> => {
  try {
    // Get current user
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error("No authenticated user found");
    }
    
    const contactDocRef = doc(db, "users", currentUser.uid, "contacts", contactId);
    await deleteDoc(contactDocRef);
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
};

// Contact Group Functions
export const createContactGroup = async (name: string, description?: string): Promise<string> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    const userId = currentUser.uid;
    
    const newGroupData = {
      name,
      description: description || "",
      contactCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId
    };
    
    // Add the document to Firestore - using proper collection() format
    const groupsCollectionRef = collection(db, "users", userId, "contactGroups");
    const newGroupRef = await addDoc(groupsCollectionRef, newGroupData);
    
    console.log("Contact group created with ID:", newGroupRef.id);
    return newGroupRef.id;
  } catch (error) {
    console.error("Error creating contact group:", error);
    throw error;
  }
};

export const getContactGroups = async (): Promise<ContactGroup[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    const userId = currentUser.uid;
    const groupsCollectionRef = collection(db, "users", userId, "contactGroups");
    const querySnapshot = await getDocs(groupsCollectionRef);
    
    const groups: ContactGroup[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      groups.push({
        id: doc.id,
        name: data.name,
        description: data.description,
        contactCount: data.contactCount,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        userId: data.userId
      });
    });
    
    return groups;
  } catch (error) {
    console.error("Error getting contact groups:", error);
    throw error;
  }
};

export const updateContactGroup = async (groupId: string, data: Partial<ContactGroup>): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    const userId = currentUser.uid;
    const groupRef = doc(db, "users", userId, "contactGroups", groupId);
    
    // Update the updatedAt timestamp
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(groupRef, updateData);
    console.log("Contact group updated successfully");
  } catch (error) {
    console.error("Error updating contact group:", error);
    throw error;
  }
};

export const deleteContactGroup = async (groupId: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    const userId = currentUser.uid;
    
    // First, update all contacts that belong to this group to remove the groupId
    const contactsCollectionRef = collection(db, "users", userId, "contacts");
    const q = query(contactsCollectionRef, where("groupId", "==", groupId));
    const querySnapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      const contactRef = doc.ref;
      batch.update(contactRef, { groupId: null });
    });
    
    // Then delete the group
    const groupRef = doc(db, "users", userId, "contactGroups", groupId);
    batch.delete(groupRef);
    
    await batch.commit();
    console.log("Contact group deleted successfully");
  } catch (error) {
    console.error("Error deleting contact group:", error);
    throw error;
  }
};

export const assignContactToGroup = async (contactId: string, groupId: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    const userId = currentUser.uid;
    
    // Update the contact with the new groupId
    const contactRef = doc(db, "users", userId, "contacts", contactId);
    await updateDoc(contactRef, { 
      groupId,
      updatedAt: new Date().toISOString()
    });
    
    // Increment the contact count in the group
    const groupRef = doc(db, "users", userId, "contactGroups", groupId);
    await updateDoc(groupRef, {
      contactCount: increment(1),
      updatedAt: new Date().toISOString()
    });
    
    console.log(`Contact ${contactId} assigned to group ${groupId}`);
  } catch (error) {
    console.error("Error assigning contact to group:", error);
    throw error;
  }
};

export const removeContactFromGroup = async (contactId: string, groupId: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    const userId = currentUser.uid;
    
    // Update the contact to remove the groupId
    const contactRef = doc(db, "users", userId, "contacts", contactId);
    await updateDoc(contactRef, { 
      groupId: null,
      updatedAt: new Date().toISOString()
    });
    
    // Decrement the contact count in the group
    const groupRef = doc(db, "users", userId, "contactGroups", groupId);
    await updateDoc(groupRef, {
      contactCount: increment(-1),
      updatedAt: new Date().toISOString()
    });
    
    console.log(`Contact ${contactId} removed from group ${groupId}`);
  } catch (error) {
    console.error("Error removing contact from group:", error);
    throw error;
  }
};

export const getContactsByGroup = async (groupId: string): Promise<Contact[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    const userId = currentUser.uid;
    const contactsCollectionRef = collection(db, "users", userId, "contacts");
    const q = query(contactsCollectionRef, where("groupId", "==", groupId));
    const querySnapshot = await getDocs(q);
    
    const contacts: Contact[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      contacts.push({
        id: doc.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        position: data.position,
        tags: data.tags,
        groupId: data.groupId,
        status: data.status,
        lastContacted: data.lastContacted,
        history: data.history || [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        userId: data.userId
      });
    });
    
    return contacts;
  } catch (error) {
    console.error("Error getting contacts by group:", error);
    throw error;
  }
};

// Email Provider functions
export const getUserEmailProviders = async (): Promise<EmailProvider[]> => {
  try {
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

export const saveEmailProvider = async (emailProvider: Partial<EmailProvider>): Promise<string> => {
  try {
    const emailProvidersCollection = collection(db, "emailProviders");
    
    const sanitizedEmailProvider = { ...emailProvider };

    if (emailProvider.id) {
      // Update existing email provider
      const emailProviderDocRef = doc(db, "emailProviders", emailProvider.id);
      await updateDoc(emailProviderDocRef, sanitizedEmailProvider);
      return emailProvider.id;
    } else {
      // Create new email provider
      const newDocRef = await addDoc(emailProvidersCollection, sanitizedEmailProvider);
      return newDocRef.id;
    }
  } catch (error) {
    console.error("Error saving email provider:", error);
    throw error;
  }
};

export const deleteEmailProvider = async (emailProviderId: string): Promise<void> => {
  try {
    const emailProviderDocRef = doc(db, "emailProviders", emailProviderId);
    await deleteDoc(emailProviderDocRef);
  } catch (error) {
    console.error("Error deleting email provider:", error);
    throw error;
  }
};

// SMTP Configuration
interface SMTPConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  secure: boolean;
  fromName: string;
  fromEmail: string;
}

export const saveSmtpConfig = async (smtpConfig: SMTPConfig): Promise<boolean> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No authenticated user found");
    }
    
    // Save SMTP configuration to the user's profile
    const userDocRef = doc(db, "users", currentUser.uid);
    
    // Update only the SMTP configuration without overwriting other user data
    await updateDoc(userDocRef, {
      "settings.smtpConfig": {
        ...smtpConfig,
        updatedAt: serverTimestamp()
      }
    });
    
    console.log("SMTP configuration saved successfully");
    return true;
  } catch (error) {
    console.error("Error saving SMTP configuration:", error);
    
    // If the user document doesn't exist yet, create it
    if (error.code === "not-found") {
      try {
        const currentUser = auth.currentUser;
        const userDocRef = doc(db, "users", currentUser.uid);
        
        await setDoc(userDocRef, {
          email: currentUser.email,
          displayName: currentUser.displayName || "",
          settings: {
            smtpConfig: {
              ...smtpConfig,
              updatedAt: serverTimestamp()
            }
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        console.log("Created new user document with SMTP configuration");
        return true;
      } catch (innerError) {
        console.error("Error creating user document:", innerError);
        return false;
      }
    }
    
    return false;
  }
};

export const getSmtpConfig = async (): Promise<SMTPConfig | null> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No authenticated user found");
    }
    
    // Get the user's profile
    const userDocRef = doc(db, "users", currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists() && userDoc.data()?.settings?.smtpConfig) {
      return userDoc.data().settings.smtpConfig as SMTPConfig;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting SMTP configuration:", error);
    return null;
  }
};

export const testSmtpConnection = async (smtpConfig: SMTPConfig): Promise<boolean> => {
  // In a real app, you would make an API call to your backend to test the SMTP connection
  // For this demo, we'll just simulate a successful connection
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Validate SMTP configuration
    if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.username || !smtpConfig.password) {
      throw new Error("Missing required SMTP configuration");
    }
    
    // Return success (in a real app, this would be the result of the API call)
    return true;
  } catch (error) {
    console.error("Error testing SMTP connection:", error);
    return false;
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
