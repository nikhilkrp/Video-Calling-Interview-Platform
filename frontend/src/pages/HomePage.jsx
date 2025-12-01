import React from 'react'
import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton } from '@clerk/clerk-react'
const HomePage = () => {

  // fetch some data without using tanstack
  return (
    <div>

      <SignedOut>
        <SignInButton mode='modal'>
          <button className=''>Sign Up Please</button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <SignOutButton />
      </SignedIn>

      <UserButton />
    </div>
  )
}

export default HomePage
