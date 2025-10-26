import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <div>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

        <div>
            <img src={assets.logo} className='mb-5 w-32' alt="" />
            <p className='w-full md:w-2/3 text-gray-600'>
            Empowering customers with choice, confidence, and convenience—UniStyle is your trusted destination for modern online shopping.
            </p>
        </div>

        <div>
            <p className='text-xl font-medium mb-5'>COMPANY</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li><Link to='/' className='hover:text-black'>Home</Link></li>
                <li><Link to='/collection' className='hover:text-black'>Collection</Link></li>
                <li><Link to='/about' className='hover:text-black'>About</Link></li>
                <li><Link to='/contact' className='hover:text-black'>Contact</Link></li>
            </ul>
        </div>

        <div>
            <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li>+1-437-123-4567</li>
                <li>contact@UniStyle.com</li>
            </ul>
        </div>

      </div>

        <div>
            <hr />
            <p className='py-5 text-sm text-center'>Copyright 2025@UniStyle - All Right Reserved.</p>
        </div>

    </div>
  )
}

export default Footer
