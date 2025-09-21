"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { createUserAddress, updateUserAddress } from '@/lib/api/addresses'
import type { UserAddress } from '@/types/database'
import { Info } from 'lucide-react'

interface AddressFormProps {
  address?: UserAddress
  onSuccess?: () => void
  onCancel?: () => void
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry',
  'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep',
  'Andaman and Nicobar Islands'
]

export function AddressForm({ address, onSuccess, onCancel }: AddressFormProps) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    label: address?.label || '',
    full_name: address?.full_name || '',
    phone: address?.phone || '',
    address_line1: address?.address_line1 || '',
    address_line2: address?.address_line2 || '',
    city: address?.city || '',
    state: address?.state || '',
    pincode: address?.pincode || '',
    country: address?.country || 'India',
    is_default: address?.is_default || false
  })

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Label validation
    if (!formData.label.trim()) {
      newErrors.label = 'Address label is required'
    } else if (formData.label.trim().length < 2) {
      newErrors.label = 'Address label must be at least 2 characters'
    }

    // Full name validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters'
    }

    // Phone validation (optional but if provided, must be valid)
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits'
    }

    // Address line 1 validation
    if (!formData.address_line1.trim()) {
      newErrors.address_line1 = 'Address line 1 is required'
    } else if (formData.address_line1.trim().length < 5) {
      newErrors.address_line1 = 'Address line 1 must be at least 5 characters'
    }

    // City validation
    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    } else if (formData.city.trim().length < 2) {
      newErrors.city = 'City must be at least 2 characters'
    }

    // State validation
    if (!formData.state) {
      newErrors.state = 'State is required'
    }

    // Pincode validation
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required'
    } else if (!/^[1-9][0-9]{5}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before saving.",
        variant: "destructive"
      })
      return
    }
    
    setLoading(true)

    try {
      if (address) {
        // Update existing address
        const { error } = await updateUserAddress(address.id, formData)
        if (error) throw error
        
        toast({
          title: "Address Updated",
          description: "Your address has been updated successfully.",
        })
      } else {
        // Create new address
        const { error } = await createUserAddress(formData)
        if (error) throw error
        
        toast({
          title: "Address Added",
          description: "Your new address has been saved successfully.",
        })
      }
      
      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save address",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{address ? 'Edit Address' : 'Add New Address'}</CardTitle>
        <CardDescription>
          {address ? 'Update your address information.' : 'Add a new delivery address to your account.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Information Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-start">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              All fields marked with * are required. Please ensure your address is accurate for delivery purposes.
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Address Label */}
          <div className="space-y-2">
            <Label htmlFor="label">Address Label *</Label>
            <Input
              id="label"
              placeholder="e.g., Home, Work, Office"
              value={formData.label}
              onChange={(e) => handleInputChange('label', e.target.value)}
              className={errors.label ? 'border-red-500' : ''}
            />
            {errors.label && (
              <p className="text-red-500 text-sm">{errors.label}</p>
            )}
          </div>

          {/* Personal Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                placeholder="Enter full name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className={errors.full_name ? 'border-red-500' : ''}
              />
              {errors.full_name && (
                <p className="text-red-500 text-sm">{errors.full_name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone}</p>
              )}
              <p className="text-xs text-gray-500">We'll use this for delivery updates</p>
            </div>
          </div>

          {/* Address Lines */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address_line1">Address Line 1 *</Label>
              <Input
                id="address_line1"
                placeholder="House/Flat number, Building name, Street"
                value={formData.address_line1}
                onChange={(e) => handleInputChange('address_line1', e.target.value)}
                className={errors.address_line1 ? 'border-red-500' : ''}
              />
              {errors.address_line1 && (
                <p className="text-red-500 text-sm">{errors.address_line1}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address_line2">Address Line 2</Label>
              <Input
                id="address_line2"
                placeholder="Area, Landmark (Optional)"
                value={formData.address_line2}
                onChange={(e) => handleInputChange('address_line2', e.target.value)}
              />
              <p className="text-xs text-gray-500">Include nearby landmark for easier delivery</p>
            </div>
          </div>

          {/* City, State, Pincode */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="Enter city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && (
                <p className="text-red-500 text-sm">{errors.city}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Select 
                value={formData.state} 
                onValueChange={(value) => handleInputChange('state', value)}
              >
                <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && (
                <p className="text-red-500 text-sm">{errors.state}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                placeholder="6-digit pincode"
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                className={errors.pincode ? 'border-red-500' : ''}
              />
              {errors.pincode && (
                <p className="text-red-500 text-sm">{errors.pincode}</p>
              )}
            </div>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              disabled
            />
          </div>

          {/* Default Address Checkbox */}
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="is_default"
              checked={formData.is_default}
              onCheckedChange={(checked) => handleInputChange('is_default', checked === true)}
            />
            <Label htmlFor="is_default" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Set as default address
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : (address ? 'Update Address' : 'Save Address')}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}