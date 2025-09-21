'use client'

import { useUser, SignOutButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, LogOut, ShoppingBag, Heart, Settings } from 'lucide-react'
import Link from 'next/link'

export function UserMenu() {
  const { user } = useUser()

  if (!user) return null

  const userInitials = user.firstName && user.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user.emailAddresses[0]?.emailAddress?.slice(0, 2).toUpperCase() || 'U'

  const userName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User'

  const avatarUrl = user.imageUrl

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} alt={userName} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/my-account" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>My Account</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/my-account/orders" className="cursor-pointer">
            <ShoppingBag className="mr-2 h-4 w-4" />
            <span>My Orders</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/wishlist" className="cursor-pointer">
            <Heart className="mr-2 h-4 w-4" />
            <span>Wishlist</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <SignOutButton>
            <button className="flex items-center w-full cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </button>
          </SignOutButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}