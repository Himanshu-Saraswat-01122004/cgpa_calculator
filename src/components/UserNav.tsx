'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut, useSession } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';
import Link from 'next/link';

export function UserNav() {
  const { data: session } = useSession();

  if (!session?.user?.email) return null;

  const userInitial = (session.user.name || session.user.email).charAt(0).toUpperCase();
  const userName = session.user.name || session.user.email.split('@')[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          id="user-nav-trigger"
          className="relative rounded-full p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-opacity hover:opacity-80"
          style={{ background: '#6366f1' }}
          aria-label="User menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback
              className="text-sm font-bold"
              style={{ background: 'var(--surface-3)', color: '#818cf8' }}
            >
              {userInitial}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 card rounded-lg p-1"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)' }}
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm font-bold"
              style={{ background: '#6366f1', color: 'white' }}>
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" style={{ background: 'var(--border-subtle)' }} />
        <DropdownMenuItem asChild>
          <Link
            id="user-nav-profile"
            href="/dashboard/profile"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm cursor-pointer hover:bg-muted focus:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <User className="h-4 w-4" />
            <span>My Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          id="user-nav-logout"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm cursor-pointer hover:bg-red-500/10 focus:bg-red-500/10 text-muted-foreground hover:text-red-400 focus:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
