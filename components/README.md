# Navbar Components

A collection of responsive navbar components built with Tailwind CSS and Framer Motion, inspired by Catalyst UI.

## Components

### Avatar
A flexible avatar component that supports images, initials, and default user icons.

```jsx
import { Avatar } from '@/components/avatar'

// With image
<Avatar src="/profile.jpg" alt="User" />

// With initials
<Avatar initials="JD" className="bg-blue-500" />

// Default (user icon)
<Avatar />

// Square avatar
<Avatar src="/logo.png" square />

// Different sizes
<Avatar src="/profile.jpg" size="sm" />
<Avatar src="/profile.jpg" size="md" />
<Avatar src="/profile.jpg" size="lg" />
<Avatar src="/profile.jpg" size="xl" />
```

### Dropdown
A dropdown menu system with smooth animations.

```jsx
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
  DropdownItem,
  DropdownLabel,
  DropdownDivider
} from '@/components/dropdown'

<Dropdown>
  <DropdownButton>
    Menu
  </DropdownButton>
  <DropdownMenu anchor="bottom start">
    <DropdownItem href="/profile">
      <UserIcon className="h-4 w-4" />
      <DropdownLabel>Profile</DropdownLabel>
    </DropdownItem>
    <DropdownDivider />
    <DropdownItem href="/settings">
      <SettingsIcon className="h-4 w-4" />
      <DropdownLabel>Settings</DropdownLabel>
    </DropdownItem>
  </DropdownMenu>
</Dropdown>
```

### Navbar
The main navbar structure with responsive design.

```jsx
import {
  Navbar,
  NavbarItem,
  NavbarSection,
  NavbarSpacer,
  NavbarDivider,
  NavbarLabel,
  MobileMenuButton
} from '@/components/navbar'

<Navbar>
  <MobileMenuButton />
  
  <NavbarSection>
    <NavbarItem href="/" current>Home</NavbarItem>
    <NavbarItem href="/about">About</NavbarItem>
  </NavbarSection>
  
  <NavbarSpacer />
  
  <NavbarSection>
    <NavbarItem href="/profile">Profile</NavbarItem>
  </NavbarSection>
</Navbar>
```

## Features

- **Responsive Design**: Automatically adapts to mobile devices with a hamburger menu
- **Smooth Animations**: Powered by Framer Motion for fluid transitions
- **Accessible**: Built with proper ARIA labels and keyboard navigation
- **Customizable**: Easy to customize with Tailwind CSS classes
- **TypeScript Ready**: Components are built with proper prop types

## Usage

1. Import the components you need
2. Customize the styling with Tailwind CSS classes
3. Add your own icons from Heroicons or other icon libraries
4. Replace placeholder images with your actual assets

## Dependencies

- React 18+
- Framer Motion
- Tailwind CSS
- Heroicons (for icons)

## Customization

All components accept standard HTML attributes and can be customized with Tailwind CSS classes. The components are designed to be flexible and easy to extend.

### Example: Custom Styling

```jsx
<Avatar 
  src="/profile.jpg" 
  className="ring-2 ring-blue-500 ring-offset-2" 
  size="lg" 
/>

<DropdownMenu 
  className="min-w-80 bg-gray-900 text-white" 
  anchor="bottom end"
>
  {/* Menu items */}
</DropdownMenu>
```
