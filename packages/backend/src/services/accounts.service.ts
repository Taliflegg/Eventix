
import { supabase } from "./database.service"
import { getAccountIdByUserId } from '../services/users.service';
import { mapKeys ,columnMappings} from './column.mapper';
import { AccountLocation } from '@eventix/shared';
export const accountsService = {


    getLocationsByUserId: async (user_id: string) => {
        //שליפת מזהה החשבון ע"י פונקציה מקובץ user.service
        const account_id = await getAccountIdByUserId(user_id);
        if (!account_id) {
            console.warn(`User ${user_id} not found or has no account_id.`);
        }
        const { data: locations, error } = await supabase
            .from('locations')
            .select('id,name,address,location_type')
            .eq('account_id', account_id);
        if (error) throw new Error(error.message);
        return locations;
    },
    getCurrentUserAccountId: async (user_id: string) => {
        const { data, error } = await supabase
            .from('accounts')
            .select('id,name')
            .eq('id', user_id)
            .single();
        if (error) throw new Error(error.message);
        return data ? data.name : null;
    },
    getLocationByLocationId: async (location_id: string) => {
        const { data, error } = await supabase
            .from('locations')
            .select('name,address')
            .eq('id', location_id)
            .single();
        if (error) throw new Error(error.message);
        return data;
    },
    addLocationConnection: async (
        account_a_id: string,
        locationAId: string,
        account_b_id: string,
        locationBId: string,
        isMutual: boolean
    ): Promise<void> => {
        const { error: insertError } = await supabase
            .from('location_connections')
            .insert([
                {
                    account_a_id: account_a_id,
                    location_a_id: locationAId,
                    account_b_id: account_b_id,
                    location_b_id: locationBId,
                    is_mutual:isMutual
                },
            ]);
            console.log('insert success++++++++++++,' )

        if (insertError) {
            console.error("Insert error:", insertError.message);
            throw new Error(`Insert failed: ${insertError.message}`);
        }
    },
     getAccountIdByUserId: async (userId: string): Promise<string | ''> => {
    const { data, error } = await supabase
      .from('users')
      .select('account_id')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new Error('account not found for this user   ');
    }
    return data.account_id;
  },

  getUsersByAccountId: async (
    accountId: string
  ): Promise<{ name: string; profile_image: string }[]> => {
    const { data, error } = await supabase
      .from('users')
      .select('name, profile_image')
      .eq('account_id', accountId);

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  },

  getAccountNameByAccountId: async (accountId: string): Promise<string> => {
    const { data, error } = await supabase
      .from('accounts')
      .select('name')
      .eq('id', accountId)
      .single();
    if (error) {
      throw new Error(error.message);
    }

    return data.name.trim();
  },

  getLocationsByAccountId: async (accountId: string): Promise<AccountLocation[]> => {
    const { data, error } = await supabase
      .from('locations')
      .select('id, name, address, location_type')
      .eq('account_id', accountId);

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map((item) =>
      mapKeys<AccountLocation>(item, columnMappings.location.toCamel)
    );
  },

  addLocationToAccount: async (
    accountId: string,
    location: {
      name: string;
      address: string;
      locationType: 'home' | 'inlaws' | 'parents' | 'friends' | 'other';
    }
  ): Promise<AccountLocation> => {
    const { data, error } = await supabase
      .from('locations')
      .insert([
        {
          account_id: accountId,
          name: location.name,
          address: location.address,
          location_type: location.locationType,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data!;
  },

  updateLocationInAccount: async (
    location: AccountLocation
  ): Promise<{ id: string; name: string; address: string; location_type: string }> => {
    const dbPayload = mapKeys(location, columnMappings.location.toSnake);
    const { data, error } = await supabase
      .from('locations')
      .update(dbPayload)
      .eq('id', dbPayload.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data!;
  },

  // getLocationsByUserId: async (user_id: string) => {
  //   const account_id = await accountsService.getAccountIdByUserId(user_id);
  //   if (!account_id) {
  //     console.warn(`User ${user_id} not found or has no account_id.`);
  //   }
  //   const { data: locations, error } = await supabase
  //     .from('locations')
  //     .select('id,name,address,location_type')
  //     .eq('account_id', account_id);
  //   if (error) throw new Error(error.message);
  //   return locations;
  // },

}



