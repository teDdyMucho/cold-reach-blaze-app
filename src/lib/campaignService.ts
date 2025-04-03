
import { Campaign } from '@/types';
import { db, auth } from './firebase';
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
  serverTimestamp,
} from 'firebase/firestore';

// Create a new campaign
export const createCampaign = async (campaign: Campaign): Promise<string> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    const campaignRef = campaign.id 
      ? doc(db, 'users', userId, 'campaigns', campaign.id)
      : doc(collection(db, 'users', userId, 'campaigns'));
    
    const campaignData = {
      ...campaign,
      id: campaignRef.id,
      updatedAt: serverTimestamp(),
      createdAt: campaign.createdAt || serverTimestamp()
    };
    
    await setDoc(campaignRef, campaignData);
    return campaignRef.id;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};

// Get a specific campaign by ID
export const getCampaign = async (campaignId: string): Promise<Campaign> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    const campaignRef = doc(db, 'users', userId, 'campaigns', campaignId);
    const campaignSnap = await getDoc(campaignRef);
    
    if (campaignSnap.exists()) {
      return { id: campaignSnap.id, ...campaignSnap.data() } as Campaign;
    } else {
      throw new Error('Campaign not found');
    }
  } catch (error) {
    console.error('Error getting campaign:', error);
    throw error;
  }
};

// Get all campaigns for the current user
export const getUserCampaigns = async (): Promise<Campaign[]> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    const campaignsRef = collection(db, 'users', userId, 'campaigns');
    const q = query(campaignsRef, orderBy('createdAt', 'desc'));
    const campaignsSnap = await getDocs(q);
    
    const campaigns: Campaign[] = [];
    campaignsSnap.forEach((doc) => {
      campaigns.push({ id: doc.id, ...doc.data() } as Campaign);
    });
    
    return campaigns;
  } catch (error) {
    console.error('Error getting campaigns:', error);
    throw error;
  }
};

// Update a campaign
export const updateCampaign = async (campaign: Campaign): Promise<void> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    await updateDoc(doc(db, 'users', userId, 'campaigns', campaign.id), {
      ...campaign,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    throw error;
  }
};

// Delete a campaign
export const deleteCampaign = async (campaignId: string): Promise<void> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    await deleteDoc(doc(db, 'users', userId, 'campaigns', campaignId));
  } catch (error) {
    console.error('Error deleting campaign:', error);
    throw error;
  }
};

// Track campaign open
export const trackCampaignOpen = async (campaignId: string): Promise<void> => {
  try {
    const campaign = await getCampaign(campaignId);
    await updateCampaign({
      ...campaign,
      opened: (campaign.opened || 0) + 1
    });
  } catch (error) {
    console.error('Error tracking campaign open:', error);
    throw error;
  }
};

// Track campaign click
export const trackCampaignClick = async (campaignId: string): Promise<void> => {
  try {
    const campaign = await getCampaign(campaignId);
    await updateCampaign({
      ...campaign,
      clicked: (campaign.clicked || 0) + 1
    });
  } catch (error) {
    console.error('Error tracking campaign click:', error);
    throw error;
  }
};

// Track campaign reply
export const trackCampaignReply = async (campaignId: string): Promise<void> => {
  try {
    const campaign = await getCampaign(campaignId);
    await updateCampaign({
      ...campaign,
      replied: (campaign.replied || 0) + 1
    });
  } catch (error) {
    console.error('Error tracking campaign reply:', error);
    throw error;
  }
};
