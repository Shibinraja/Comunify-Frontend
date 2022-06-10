/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import bgSignInImage from '../../../../assets/images/bg-sign.svg';
import eyeIcon from '../../../../assets/images/eye.svg';
import Input from 'common/input';
import Button from 'common/button';
const CreateNewPassword = () => {
  return (
    <div className='w-full flex flex-col  '>
      <div className='flex w-full relative'>
        <div className='w-1/2 password-cover-bg bg-no-repeat bg-left rounded-lg  bg-thinBlue flex items-center justify-center py-20 fixed'>
          <img src={bgSignInImage} alt='' />
        </div>
        <div className='w-1/2 flex pl-7.5 mt-13.1 flex-col  overflow-y-auto no-scroll-bar absolute right-0'>
          <h1 className='font-Inter font-bold text-signIn text-neutralBlack leading-2.8'>
            Forgot Password
          </h1>
          <p className='mt-0.78 text-desc font-normal leading-1.8 font-Inter text-lightGray max-w-sm'>
            Enter your new password.
          </p>
          <form className='w-25.9 mt-1.9 ' autoComplete='off'>
            <div className='password  relative'>
              <Input
                type='New Password'
                placeholder='New Password'
                label='New Password'
                id='password1'
                name='password1'
              />
              <img
                className='absolute icon-holder left-96 cursor-pointer'
                src={eyeIcon}
                alt=''
              />
            </div>
            <div className='password relative mt-1.258'>
              <Input
                type='password'
                placeholder='Confirm Password'
                label='Confirm Password'
                id='password2'
                name='password2'
              />
              <img
                className='absolute icon-holder left-96 cursor-pointer'
                src={eyeIcon}
                alt=''
              />
            </div>
            <Button
              text='Submit'
              type='submit'
              className='font-Poppins rounded-lg text-base text-white mt-1.8 h-3.6 transition ease-in duration-300 w-full hover:shadow-buttonShadowHover'
            />
          </form>
        </div>
      </div>
      <div className='py-1.9'></div>
      <div className='footer'></div>
    </div>
  );
};
export default CreateNewPassword;
