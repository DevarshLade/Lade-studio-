import { supabase } from '@/lib/supabase'
import type { UserAddress, UserAddressInsert, UserAddressUpdate } from '@/types/database'

/**
 * Get all addresses for the user
 * For Clerk migration, this function now accepts user ID as a parameter
 */
export async function getUserAddresses(userId: string): Promise<{ 
  data: UserAddress[] | null; 
  error: Error | null 
}> {
  try {
    // Validate user ID
    if (!userId) {
      throw new Error('User ID is required to fetch addresses')
    }

    const { data: addresses, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return { data: addresses, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get user's default address
 * For Clerk migration, this function now accepts user ID as a parameter
 */
export async function getUserDefaultAddress(userId: string): Promise<{ 
  data: UserAddress | null; 
  error: Error | null 
}> {
  try {
    // Validate user ID
    if (!userId) {
      throw new Error('User ID is required to fetch default address')
    }

    const { data: address, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No default address found
        return { data: null, error: null }
      }
      throw new Error(error.message)
    }

    return { data: address, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Create a new address for the user
 * For Clerk migration, this function now accepts user ID as a parameter
 */
export async function createUserAddress(
  userId: string,
  addressData: Omit<UserAddressInsert, 'user_id'>
): Promise<{ data: UserAddress | null; error: Error | null }> {
  try {
    // Validate user ID
    if (!userId) {
      throw new Error('User ID is required to create address')
    }

    const newAddress: UserAddressInsert = {
      ...addressData,
      user_id: userId
    }

    const { data: address, error } = await (supabase as any)
      .from('user_addresses')
      .insert(newAddress)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return { data: address, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Update an existing address
 * For Clerk migration, this function now accepts user ID as a parameter for validation
 */
export async function updateUserAddress(
  userId: string,
  addressId: string,
  updates: Omit<UserAddressUpdate, 'user_id' | 'id'>
): Promise<{ data: UserAddress | null; error: Error | null }> {
  try {
    // Validate user ID
    if (!userId) {
      throw new Error('User ID is required to update address')
    }

    // First verify the address belongs to the user
    const { data: existingAddress, error: fetchError } = await supabase
      .from('user_addresses')
      .select('id')
      .eq('id', addressId)
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new Error('Address not found or does not belong to user')
      }
      throw new Error(fetchError.message)
    }

    const { data: address, error } = await (supabase as any)
      .from('user_addresses')
      .update(updates)
      .eq('id', addressId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return { data: address, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Delete an address
 * For Clerk migration, this function now accepts user ID as a parameter for validation
 */
export async function deleteUserAddress(userId: string, addressId: string): Promise<{ error: Error | null }> {
  try {
    // Validate user ID
    if (!userId) {
      throw new Error('User ID is required to delete address')
    }

    // First verify the address belongs to the user
    const { data: existingAddress, error: fetchError } = await supabase
      .from('user_addresses')
      .select('id')
      .eq('id', addressId)
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new Error('Address not found or does not belong to user')
      }
      throw new Error(fetchError.message)
    }

    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', addressId)

    if (error) {
      throw new Error(error.message)
    }

    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

/**
 * Set an address as default (and unset others)
 * For Clerk migration, this function now accepts user ID as a parameter
 */
export async function setDefaultAddress(userId: string, addressId: string): Promise<{ 
  data: UserAddress | null; 
  error: Error | null 
}> {
  try {
    // Validate user ID
    if (!userId) {
      throw new Error('User ID is required to set default address')
    }

    // First verify the address belongs to the user
    const { data: existingAddress, error: fetchError } = await supabase
      .from('user_addresses')
      .select('id')
      .eq('id', addressId)
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new Error('Address not found or does not belong to user')
      }
      throw new Error(fetchError.message)
    }

    // Unset all other addresses as default
    await supabase
      .from('user_addresses')
      .update({ is_default: false })
      .eq('user_id', userId)

    // Set this address as default
    const { data: address, error } = await (supabase as any)
      .from('user_addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return { data: address, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get address by ID
 * For Clerk migration, this function now accepts user ID as a parameter for validation
 */
export async function getAddressById(userId: string, addressId: string): Promise<{ 
  data: UserAddress | null; 
  error: Error | null 
}> {
  try {
    // Validate user ID
    if (!userId) {
      throw new Error('User ID is required to fetch address')
    }

    const { data: address, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('id', addressId)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: null }
      }
      throw new Error(error.message)
    }

    return { data: address, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}