"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cancelOrder } from "@/lib/api/orders"
import type { Order } from "@/types/database"

type CancelOrderDialogProps = {
  isOpen: boolean
  onClose: () => void
  order: Order
  onCancelled: () => void
}

const CANCELLATION_REASONS = [
  "Changed my mind about the purchase",
  "Found a better price elsewhere", 
  "Ordered by mistake",
  "Shipping will take too long",
  "Product doesn't meet my expectations",
  "Financial constraints",
  "Other"
]

export function CancelOrderDialog({ isOpen, onClose, order, onCancelled }: CancelOrderDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [customReason, setCustomReason] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleCancel = async () => {
    const reason = selectedReason === 'Other' ? customReason.trim() : selectedReason
    
    if (!reason) {
      toast({
        title: "Reason Required",
        description: "Please select or provide a reason for cancelling your order.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    
    try {
      const { error } = await cancelOrder(order.id, reason)
      
      if (error) throw error

      toast({
        title: "Order Cancelled",
        description: `Your order #${order.id.split('-')[0].toUpperCase()} has been successfully cancelled.`,
      })
      
      onCancelled()
      onClose()
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: (error as Error).message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Cancel Order</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel order #{order.id.split('-')[0].toUpperCase()}?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Why are you cancelling this order?</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason} className="mt-2">
              {CANCELLATION_REASONS.map((reason) => (
                <div key={reason} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason} id={reason} />
                  <Label htmlFor={reason} className="text-sm cursor-pointer">
                    {reason}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          {selectedReason === 'Other' && (
            <div className="space-y-2">
              <Label htmlFor="custom-reason" className="text-sm font-medium">
                Please specify your reason
              </Label>
              <Textarea
                id="custom-reason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Please provide a detailed reason..."
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Keep Order
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleCancel} 
            disabled={isLoading || !selectedReason}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Cancel Order'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}