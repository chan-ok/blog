'use client';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { Menu } from '@base-ui-components/react/menu';
import { Menubar } from '@base-ui-components/react/menubar';
import { Book, Mail, User } from 'lucide-react';
import Link from 'next/link';

export default function NavigationBar() {
  const { isMd } = useBreakpoint();

  return (
    <Menubar className="flex space-x-2 md:space-x-4">
      <Menu.Root>
        <Menu.Trigger className="h-8 rounded-2xl px-2 text-sm font-medium text-gray-600 outline-none select-none hover:bg-gray-100 focus-visible:bg-gray-100">
          <Link href="/about" className="flex items-center gap-1">
            <User size={16} />
            {isMd ? 'About' : null}
          </Link>
        </Menu.Trigger>
      </Menu.Root>
      <Menu.Root>
        <Menu.Trigger className="h-8 rounded-2xl px-2 text-sm font-medium text-gray-600 outline-none select-none hover:bg-gray-100 focus-visible:bg-gray-100">
          <Link href="/posts" className="flex items-center gap-1">
            <Book size={16} />
            {isMd ? 'Posts' : null}
          </Link>
        </Menu.Trigger>
      </Menu.Root>
      <Menu.Root>
        <Menu.Trigger className="h-8 rounded-2xl px-2 text-sm font-medium text-gray-600 outline-none select-none hover:bg-gray-100 focus-visible:bg-gray-100">
          <Link href="/contact" className="flex items-center gap-1">
            <Mail size={16} />
            {isMd ? 'Contact' : null}
          </Link>
        </Menu.Trigger>
      </Menu.Root>
    </Menubar>
  );
}
