import e from 'express';
import { deleteRequest, getRequest, putRequest, postRequest } from './apiServices';
import { UsersInAccountResponse, LocationsInAccountResponse, AccountLocation, GetAccountNameResponse, Location,BaseResponse } from '@eventix/shared'



const accountService = {

  getUsersInMyAccount: async (): Promise<UsersInAccountResponse> => {
    const response = await getRequest<UsersInAccountResponse>('/accounts/my-account/users');
    if (response.success && response.data) {
      console.log("from getUsersInMyAccount: ", response.data)
      return response;
    }
    throw new Error(response.error || 'Failed to fetch my accounts users');
  },
  getLocationsInMyAccount: async (): Promise<LocationsInAccountResponse> => {
    const response = await getRequest<LocationsInAccountResponse>('/accounts/my-account/locations');
    if (response.success && response.data) {
      console.log("from getLocationsInMyAccount: ", response.data)
      return response;
    }
    throw new Error(response.error || 'Failed to fetch my accounts users');
  },
  getAccountName: async (): Promise<string> => {
    const response = await getRequest<GetAccountNameResponse>('/accounts/name');

    if (response.success && typeof response.data === 'string') {
      console.log("from get account name in service: ", response.data);
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch account name');
  },

  addLocation: async (location: AccountLocation): Promise<BaseResponse> => {
    const response = await postRequest<BaseResponse>('/accounts/my-account/locations', location);

    if (response.success) {
      return { success: true };
    }
    throw new Error(response.error || 'Failed to add location');
  },

  updateUserAccount: async (accountId: string): Promise<{ success: true }> => {
    const response = await putRequest<any>('/users/update-account', { accountId });
  
    if (response?.message === 'Account ID updated successfully') {
      return { success: true };
    }
  
    throw new Error(response?.error || 'Failed to update user account');
  },
  
  

  updateLocation: async (location: AccountLocation): Promise<BaseResponse> => {
    const response = await putRequest<BaseResponse>(`/accounts/my-account/locations/${location.id}`, location);

    if (response.success) {
      return { success: true };
    }
    throw new Error(response.error || 'Failed to update location');
  },


}

export const {
  getUsersInMyAccount,
  getLocationsInMyAccount,
  addLocation,
  updateLocation,

} = accountService;

export default accountService;


export const getLocationsByUserId = async (): Promise<Location[]> => {
  return await getRequest<Location[]>(`/locations`);
};

export const getCurrentUserAccountId = async (userId: string): Promise<string | null> => {
  try {
    const response = await getRequest<{ accountName: string }>(`/locations/${userId}`);
    console.log("first:", response);

    return response ? response.accountName : null;
  } catch (error) {
    console.error('Error fetching account ID:', error);
    return null;
  }
};
export const getLocationByLocationId = async (locationId: string): Promise<Location | null> => {
  try {
    const response = await getRequest<{ locationName: Location }>(`/Locations/Location/${locationId}`);
    console.log("second", response);

    return response?.locationName ?? null;
  } catch (error) {
    console.error('Error fetching location by ID:', error);
    return null;
  }
};
export const addLocationConnection = async (
  accountAId: string,
  locationAId: string,
  accountBId: string,
  locationBId: string,
  isMutual: boolean
  ): Promise<void> => {
  try {
    await postRequest(`/locations/postLocation`, {
      account_a_id: accountAId,
      locationAId: locationAId,
      account_b_id: accountBId,
      locationBId: locationBId,
      is_mutual: isMutual,
    }  );
  } catch (error) {
    console.error('Error putting location:', error);
    throw error;
  }
}