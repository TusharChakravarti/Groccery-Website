import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div className='mt-16 flex flex-col '>
      
      
      <div className='flex flex-col items-end w-max mb-10'>
        <p className='text-2xl font-medium uppercase'>Contact Us</p>
    
        <div className="w-16 h-0.5 bg-primary-dull rounded-full"></div>
      </div>





      <div className="flex flex-col justify-center md:flex-row gap-10 mb-28">
        
        <img 
            className="w-full md:max-w-[480px] object-cover rounded-lg shadow-sm" 
            src={assets.contact_img} 
            alt="KhaoFresh Contact" 
        />

        <div className="flex flex-col justify-center items-start gap-2">
          <p className="font-semibold text-xl text-gray-600">Our Store</p>
          <p className="text-gray-500">

            KhaoFresh HQ
             <br /> 
            Shop No. 12, Sunshine Complex
             <br /> 
            Near Traffic Park, Dharampeth
             <br /> 
            Nagpur, Maharashtra - 440010
             <br /> 
            India


           
            
          </p>
          <p className="text-gray-500">
            Phone: +918329007068 <br /> 
            Email: support@khaofresh.com
          </p>

          <p className="font-semibold text-xl text-gray-600">Careers at KhaoFresh</p>
          <p className="text-gray-500">Join our team and help deliver freshness every day.</p>
        </div>

      </div>

    </div>
  )
}

export default Contact