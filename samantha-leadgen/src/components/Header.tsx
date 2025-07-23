'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Menu } from '@headlessui/react';
import { ChevronDownIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const { user, profile, signOut } = useAuth();

  if (!user || !profile) return null;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Lead Management Dashboard
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* User Menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {profile.display_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {profile.role.replace('_', ' ').charAt(0).toUpperCase() + profile.role.slice(1).replace('_', ' ')}
                  </p>
                </div>
                {profile.avatar_url ? (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={profile.avatar_url}
                    alt={profile.display_name}
                  />
                ) : (
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                )}
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </Menu.Button>

              <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                        <p className="font-medium">{profile.display_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {user.email}
                        </p>
                      </div>
                    )}
                  </Menu.Item>
                  <div className="border-t border-gray-100 dark:border-gray-700"></div>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => signOut()}
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                      >
                        <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  );
}