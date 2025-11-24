'use client';
import { Menu } from '@base-ui-components/react/menu';
import { Menubar } from '@base-ui-components/react/menubar';
import Link from 'next/link';

export default function NavigationBar() {
  return (
    <Menubar className="flex space-x-2">
      <Menu.Root>
        <Menu.Trigger className="h-8 rounded-2xl px-3 text-sm font-medium text-gray-600 outline-none select-none hover:bg-gray-100 focus-visible:bg-gray-100">
          <Link href="/about">About</Link>
        </Menu.Trigger>
        <Menu.Trigger className="h-8 rounded-2xl px-3 text-sm font-medium text-gray-600 outline-none select-none hover:bg-gray-100 focus-visible:bg-gray-100">
          <Link href="/posts">Posts</Link>
        </Menu.Trigger>
        <Menu.Trigger className="h-8 rounded-2xl px-3 text-sm font-medium text-gray-600 outline-none select-none hover:bg-gray-100 focus-visible:bg-gray-100">
          <Link href="/contact">Contact</Link>
        </Menu.Trigger>
      </Menu.Root>
    </Menubar>
  );
}
