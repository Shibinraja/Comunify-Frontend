import React, { useEffect } from 'react';
import { AppDispatch } from '../../../../store';
import { useDispatch } from 'react-redux';

import { useAppSelector } from '@/hooks/useRedux';
import SubscriptionCard from 'common/subscriptionCard/SubscriptionCard';
import authSlice from '../../store/slices/auth.slice';
import { SubscriptionPackages } from '../../interface/auth.interface';

const SubscriptionExpired: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();

  const subscriptionData = useAppSelector((state) => state.auth.subscriptionData);

  const comunifySubscriptionPlan: SubscriptionPackages[] =
    (subscriptionData.length > 0 && subscriptionData.filter((plans: SubscriptionPackages) => plans.viewName.trim() !== 'Free Trial')) || [];

  useEffect(() => {
    dispatch(authSlice.actions.getSubscriptions());
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center mt-[121px] overflow-scroll h-full mb-52">
      <h3 className="text-neutralBlack font-bold font-Inter text-signIn leading-2.8">Subscription Expired!</h3>
      <p className="mt-2.5 text-lightGray font-Inter font-normal leading-1.43 text-desc">Choose a plan to continue.</p>
      <div className="subscriptionCard w-[20%] lg:w-[414px]  2xl:w-[20%] 3xl:w-[16%]">
        {comunifySubscriptionPlan?.map((data: SubscriptionPackages) => (
          <SubscriptionCard key={data.id} subscriptionData={data} />
        ))}
      </div>
      <div className="py-1.9"></div>
    </div>
  );
};

export default SubscriptionExpired;
