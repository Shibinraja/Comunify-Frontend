/* eslint-disable indent */
/* eslint-disable no-constant-condition */
import Button from 'common/button';
import { TabPanel } from 'common/tabs/TabPanel';
import ToggleButton from 'common/ToggleButton/ToggleButton';
import React, { Fragment, useEffect, useState } from 'react';

import { buildStyles, CircularProgressbarWithChildren } from 'react-circular-progressbar';
import ProgressProvider from './ProgressProvider';
import moment from 'moment';
import Modal from 'react-modal';
import Input from '../../../../common/input';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import AddCard from '../addCard/AddCard';
import CornerIcon from '../../../..//assets/images/corner-img.svg';
import TickWhiteIcon from '../../../..//assets/images/tick-white.svg';

import { showErrorToast, showSuccessToast } from '../../../../common/toast/toastFunctions';
import {
  AddedCardDetails,
  BillingDetails,
  ClientSecret,
  SubscriptionDetails,
  SubscriptionPackageFeatures,
  UpdateSubscriptionAutoRenewal,
  UpdateSubscriptionBody
} from '../../interface/settings.interface';
import {
  createCardService,
  getCardDetailsService,
  getChoseSubscriptionPlanDetailsService,
  setPlanAutoRenewalService
} from '../../services/settings.services';

import { alphabets_only_regex_with_single_space, whiteSpace_single_regex, width_70, width_90 } from '../../../../constants/constants';
import { stripePublishableKey } from '@/lib/config';
import { SubscriptionPackages } from 'modules/authentication/interface/auth.interface';
import Skeleton from 'react-loading-skeleton';
import useSkeletonLoading from '@/hooks/useSkeletonLoading';
import authSlice from 'modules/authentication/store/slices/auth.slice';

const CheckoutForm = React.lazy(() => import('../subscription/CheckoutForm'));

type Props = {
  hidden: boolean;
  selectedTab: string;
  subscriptionPlanDetails: SubscriptionPackages[];
};

const Subscription: React.FC<Props> = ({ hidden, selectedTab, subscriptionPlanDetails }) => {
  const gradientTransform = `rotate(90)`;
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | undefined>();
  const [addedCardDetails, setAddedCardDetails] = useState<AddedCardDetails[]>([]);
  const [toggle, setToggle] = useState<boolean>(true);
  const [isBillingDetailsModal, setIsBillingDetailsModal] = useState<{ billingDetails: boolean; cardDetails: boolean }>({
    billingDetails: false,
    cardDetails: false
  });
  const [billingDetails, setBillingDetails] = useState<BillingDetails>({ billingName: '', billingEmail: '' });
  const [clientSecret, setClientSecret] = useState<string>('');
  const [subscriptionTabLoader, setSubscriptionTabLoader] = useState<{ planAutoRenewalLoader: boolean; getSubscriptionPlanLoader: boolean }>({
    planAutoRenewalLoader: false,
    getSubscriptionPlanLoader: false
  });
  const stripePromise = loadStripe(stripePublishableKey);
  const comunifyPlusPlanDetails = subscriptionPlanDetails?.filter(
    (data: SubscriptionPackages) => data?.name?.toLocaleLowerCase().trim() === 'comunify plus'
  )[0];

  const getSubscriptionsLoader = useSkeletonLoading(authSlice.actions.getSubscriptions.type);

  useEffect(() => {
    getCardDetails();
    getCurrentSubscriptionPlanDetails();
    getSecretKeyForStripe();
  }, []);

  useEffect(() => {
    if (selectedTab === 'subscription') {
      getCurrentSubscriptionPlanDetails();
    }
  }, [selectedTab]);

  // eslint-disable-next-line space-before-function-paren
  const getCurrentSubscriptionPlanDetails = async () => {
    setSubscriptionTabLoader((prev) => ({ ...prev, getSubscriptionPlanLoader: true }));
    const response: SubscriptionDetails = await getChoseSubscriptionPlanDetailsService();
    setSubscriptionTabLoader((prev) => ({ ...prev, getSubscriptionPlanLoader: false }));
    if (response?.stripeSubscriptionId) {
      setSubscriptionDetails(response);
      setToggle(response?.autoRenewal);
    } else {
      setSubscriptionDetails(response);
    }
  };

  // eslint-disable-next-line space-before-function-paren
  const getCardDetails = async () => {
    const response: AddedCardDetails[] = await getCardDetailsService();
    setAddedCardDetails(response);
  };

  // eslint-disable-next-line space-before-function-paren
  const setPlanAutoRenewal = async () => {
    setSubscriptionTabLoader((prev) => ({ ...prev, planAutoRenewalLoader: true }));
    const updateSubscriptionBody: UpdateSubscriptionBody = {
      autoRenewal: toggle ? false : true,
      subscriptionId: subscriptionDetails?.stripeSubscriptionId ?? '',
      userSubscriptionId: subscriptionDetails?.id ?? ''
    };
    const response: UpdateSubscriptionAutoRenewal = await setPlanAutoRenewalService(updateSubscriptionBody);
    if (Object.keys(response).length) {
      setToggle(response?.autoRenewSubscription);
      if (response?.autoRenewSubscription === false) {
        showSuccessToast('Plan auto renewal de-activated');
      } else if (response?.autoRenewSubscription === true) {
        showSuccessToast('Plan auto renewal activated');
      }
      setSubscriptionTabLoader((prev) => ({ ...prev, planAutoRenewalLoader: false }));
    } else {
      showErrorToast('Failed to alter your current plan auto renewal setting');
      setToggle((prev) => !prev);
    }
  };

  const calculateDaysToSubscriptionExpiry = () => {
    const expiryDate = moment(subscriptionDetails?.endAt);
    const currentDate = moment();
    return expiryDate.diff(currentDate, 'days');
  };

  // eslint-disable-next-line space-before-function-paren
  const getSecretKeyForStripe = async () => {
    const response: ClientSecret = await createCardService();
    setClientSecret(response?.clientSecret);
  };

  const billingDetailsInitialValues = {
    billingName: '',
    billingEmail: ''
  };

  const options = {
    clientSecret: clientSecret && clientSecret
    // Fully customizable with appearance API.
    // appearance: {/*...*/}
  };

  const handleBillingDetailsSubmit = (values: BillingDetails) => {
    setBillingDetails(values);
    showSuccessToast('Saved billing name and email');
    setIsBillingDetailsModal({ billingDetails: false, cardDetails: true });
  };

  const handleCheckoutFormModal = () => {
    setIsBillingDetailsModal((prev) => ({ ...prev, cardDetails: false }));
  };

  const passNewlyAddedCardDetailsToChild = (newlyAddedCardData: AddedCardDetails) => {
    setAddedCardDetails([...addedCardDetails, newlyAddedCardData]);
  };

  return (
    <TabPanel hidden={hidden}>
      <div className="subscription mt-2.625 ">
        <h3 className="text-infoBlack font-Poppins font-semibold text-base leading-1.56 dark:text-white">Subscription</h3>
        {subscriptionDetails?.subscriptionPackage?.name.toLocaleLowerCase().trim() === 'free trial' && (
          <p className="font-Poppins text-error text-black dark:text-greyDark leading-1.31 font-normal">
            To keep using this account after the trial ends, set up a subscription
          </p>
        )}

        <div className="flex border bg-paymentSubscription dark:bg-thirdDark w-full h-8.37 shadow-paymentSubscriptionCard box-border rounded-0.9 justify-between items-center px-[27px] mt-1.8">
          <div className="flex">
            <div className="flex flex-col">
              <div className="font-semibold font-Poppins leading-1.56 text-infoBlack dark:text-white text-base">
                {!subscriptionTabLoader.getSubscriptionPlanLoader ? 'Selected Plan' : <Skeleton width={width_90} />}
              </div>
              <div className="mt-0.313 ">
                {!subscriptionTabLoader.getSubscriptionPlanLoader ? (
                  <Button
                    type="button"
                    text={subscriptionDetails?.subscriptionPackage?.name ?? 'No active plan'}
                    className="px-2 h-[26px] bg-trialButton border-none text-white text-error font-Poppins font-medium leading-1.31 cursor-auto uppercase"
                  />
                ) : (
                  <Skeleton width={width_90} />
                )}
              </div>
            </div>
            {subscriptionDetails !== null && (
              <div className="flex flex-col pl-[98px] dark:text-createdAtGrey">
                <div className="font-semibold font-Poppins leading-1.56 text-infoBlack dark:text-white text-base">
                  {!subscriptionTabLoader.getSubscriptionPlanLoader ? 'Features' : <Skeleton width={width_90} />}
                </div>
                <div className="flex gap-4 font-Poppins   ">
                  <div className="flex items-center gap-x-1 pt-1">
                    <div className="text-listGray text-error font-normal leading-1.31 flex">
                      {!subscriptionTabLoader.getSubscriptionPlanLoader ? (
                        <Fragment>
                          <span>
                            {subscriptionPlanDetails
                              ?.filter(
                                (data: SubscriptionPackages) =>
                                  data?.name.toLocaleLowerCase().trim() === subscriptionDetails?.subscriptionPackage?.name.toLocaleLowerCase().trim()
                              )
                              .map((data: SubscriptionPackages) =>
                                data?.features?.map(
                                  (data: SubscriptionPackageFeatures) =>
                                    `| ${data?.value === '1' ? 'Single' : data?.value} ${data?.comunifyFeature?.name} `
                                )
                              )}{' '}
                            |
                          </span>
                        </Fragment>
                      ) : (
                        <Skeleton width={width_90} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-end">
            {!subscriptionTabLoader.getSubscriptionPlanLoader ? (
              <div className="relative w-[63.36px] h-[63.36px]">
                <svg className="absolute">
                  <defs>
                    <linearGradient id={'hello'} gradientTransform={gradientTransform}>
                      <stop offset="16.29%" stopColor={'#ED9333'} />
                      <stop offset="85.56%" stopColor={'#F9CB37'} />
                    </linearGradient>
                  </defs>
                </svg>
                <ProgressProvider valueStart={0} valueEnd={calculateDaysToSubscriptionExpiry()}>
                  {(value: number) => (
                    <CircularProgressbarWithChildren
                      value={value}
                      strokeWidth={10}
                      styles={buildStyles({
                        pathColor: `url(#${'hello'})`
                      })}
                    >
                      <span className="font-medium font-Poppins text-[22.01px] text-[#151515]">{calculateDaysToSubscriptionExpiry()}</span>
                    </CircularProgressbarWithChildren>
                  )}
                </ProgressProvider>
              </div>
            ) : (
              <Skeleton circle width={'63.6px'} height={'63.6px'} />
            )}
            <div className="pt-2">
              <div className="font-Poppins font-semibold text-[13px] leading-0.93 text-[#151515] pb-1 dark:text-greyDark">
                {!subscriptionTabLoader.getSubscriptionPlanLoader ? (
                  calculateDaysToSubscriptionExpiry() > 1 ? (
                    'Days Left'
                  ) : (
                    'Day Left'
                  )
                ) : (
                  <Skeleton width={width_70} />
                )}
              </div>
            </div>
          </div>
        </div>
        {/* <div className="border-t border-[#E6E6E6] mt-8"></div> */}
        <div className="border border-[#E6E6E6] p-4 rounded-lg mt-4">
          {!!addedCardDetails?.length && (
            <div className="renewal mt-[10px] mb-5">
              <div className="flex justify-between  items-center">
                <div className="flex flex-col">
                  <h3 className="font-Poppins text-base text-renewalBlack leading-1.31 font-semibold dark:text-white">Auto Renewal</h3>
                  <p className="text-renewalGray font-normal  text-trial leading-1.31 mt-1 dark:text-greyDark">
                    Your auto renewal is {toggle ? 'active' : 'inactive'}{' '}
                  </p>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="text-renewalLightGray text-trial font-medium leading-1.31 font-Poppins dark:text-white">NO</div>
                  <ToggleButton value={toggle} onChange={() => setPlanAutoRenewal()} isLoading={subscriptionTabLoader.planAutoRenewalLoader} />
                  <div className="text-trial font-medium leading-1.31 font-Poppins dark:text-white">YES</div>
                </div>
              </div>
            </div>
          )}

          {!!addedCardDetails?.length && <div className="border-t border-[#E6E6E6] mt-8"></div>}

          {addedCardDetails?.length ? (
            <div>
              <AddCard subscriptionDetails={subscriptionDetails ?? undefined} toggle={toggle} />
            </div>
          ) : (
            <div className="upgrade mt-1.8 ">
              <h3 className="font-Poppins font-semibold text-infoBlack leading-2.18 text-infoData dark:text-white">
                {getSubscriptionsLoader ? <Skeleton width={width_90} /> : 'Upgrade'}
              </h3>
              <div className="flex mt-1.8">
                <div
                  onClick={() => setIsBillingDetailsModal((prev) => ({ ...prev, billingDetails: true }))}
                  className="relative bg-paymentSubscription paymentSubscription h-[229px] px-[18px] py-[30px] dark:bg-thirdDark box-border w-13.31 pb-5 shadow-paymentSubscriptionCard flex flex-col items-center justify-center border-gradient-rounded cursor-pointer"
                >
                  <img className="absolute -right-[2.05rem] -top-[1.8rem] verify-box" src={CornerIcon} alt="" />
                  <div className="absolute right-2 top-2 w-[19px] h-[19px] border border-white rounded-full verify-box">
                    <img className="w-3/4 mt-[4px] ml-[3px]" src={TickWhiteIcon} alt="" />
                  </div>

                  <h5 className="flex items-center justify-center">
                    {getSubscriptionsLoader ? (
                      <Skeleton width={width_90} />
                    ) : (
                      <Fragment>
                        <span className="price font-Poppins font-semibold leading-2.8 text-renewalPrice ">{comunifyPlusPlanDetails?.amount}</span>
                        <span className="text-renewalPlan font-medium font-Poppins leading-1.43">/month</span>
                      </Fragment>
                    )}
                  </h5>
                  <div className="font-semibold font-Poppins leading-1.56 text-infoBlack text-base dark:text-white">
                    {getSubscriptionsLoader ? <Skeleton width={width_90} /> : comunifyPlusPlanDetails?.name}
                  </div>
                  <p className="text-center text-card font-Poppins font-normal w-[200px] text-renewalGray mt-5 dark:text-greyDark">
                    {getSubscriptionsLoader ? <Skeleton width={width_90} /> : `${comunifyPlusPlanDetails?.name} Plan`}
                  </p>
                </div>
                <div className="flex flex-col ml-5 bg-paymentSubscription h-[229px] dark:bg-thirdDark w-13.31 h-14.31 box-border pb-10 shadow-paymentSubscriptionCard pt-[49px] pl-5 border-gradient-rounded">
                  <div className="font-semibold font-Poppins leading-1.56 text-infoBlack text-base dark:text-white">
                    {getSubscriptionsLoader ? <Skeleton width={width_90} /> : 'Features'}
                  </div>
                  {getSubscriptionsLoader
                    ? Array.from({ length: 4 }, (_, i) => i + 1).map((type: number) => (
                        <Fragment key={type}>
                          <div className="flex items-center gap-x-1 mt-[8px] pb-1">
                            <div className="w-[12px] h-[12px] rounded-full flex justify-center items-center">
                              <Skeleton circle width={'15px'} height={'15px'} />
                            </div>
                            <div className="font-Poppins text-error text-listGray dark:text-greyDark leading-1.31 font-normal">
                              <Skeleton width={width_90} />
                            </div>
                          </div>
                        </Fragment>
                      ))
                    : subscriptionPlanDetails
                        ?.filter((data: SubscriptionPackages) => data?.name.toLocaleLowerCase().trim() === 'comunify plus')
                        .map((data: SubscriptionPackages) =>
                          data?.features?.map((data: SubscriptionPackageFeatures, index: number) => (
                            <div key={index} className="flex items-center gap-x-1 mt-[8px] pb-1">
                              <div className="w-[12px] h-[12px] rounded-full tick-box flex justify-center items-center">
                                <img src={TickWhiteIcon} alt="" />
                              </div>
                              <div className="font-Poppins text-error text-listGray dark:text-greyDark leading-1.31 font-normal">
                                {`${data?.value === '1' ? 'Single' : data?.value} ${data?.comunifyFeature?.name}`}
                              </div>
                            </div>
                          ))
                        )}
                  {/* {} */}
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-col ">
            <Modal
              isOpen={isBillingDetailsModal.billingDetails}
              shouldCloseOnOverlayClick={false}
              className="w-24.31 pb-12 mx-auto rounded-lg border-fetching-card bg-white shadow-modal"
              style={{
                overlay: {
                  display: 'flex',
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  alignItems: 'center'
                }
              }}
            >
              <div className="flex flex-col">
                <h3 className="text-center font-Inter font-semibold text-xl mt-1.8 text-black leading-6">Upgrade</h3>
                <Formik
                  initialValues={billingDetailsInitialValues}
                  onSubmit={handleBillingDetailsSubmit}
                  validateOnChange={true}
                  validationSchema={billingDetailsScheme}
                >
                  {({ errors, handleBlur, handleChange, handleSubmit, touched, values }): JSX.Element => (
                    <Form
                      className="flex flex-col relative  px-1.93 mt-9"
                      onSubmit={handleSubmit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                    >
                      <label htmlFor="name " className="leading-1.31 font-Poppins font-normal text-trial text-infoBlack ">
                        Billing Name
                      </label>
                      <Input
                        type="text"
                        name="billingName"
                        id="billingNameId"
                        value={values.billingName}
                        className="mt-0.375 inputs app-result-card-border box-border bg-white shadow-inputShadow rounded-0.3 h-2.81 w-20.5 placeholder:font-Poppins placeholder:text-sm placeholder:text-thinGray placeholder:leading-1.31 focus:outline-none px-3"
                        placeholder="Enter Name"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        errors={Boolean(touched.billingName && errors.billingName)}
                        helperText={touched.billingName && errors.billingName}
                      />
                      <label htmlFor="description" className="leading-1.31 font-Poppins font-normal text-trial text-infoBlack mt-1.06">
                        Billing Email
                      </label>
                      <Input
                        name="billingEmail"
                        id="billingEmailId"
                        value={values.billingEmail}
                        className="mt-0.375 inputs app-result-card-border box-border bg-white shadow-inputShadow rounded-0.3 h-2.81 w-20.5 placeholder:font-Poppins placeholder:text-sm placeholder:text-thinGray placeholder:leading-1.31 focus:outline-none px-3"
                        placeholder="example@email.com"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        errors={Boolean(touched.billingEmail && errors.billingEmail)}
                        helperText={touched.billingEmail && errors.billingEmail}
                      />
                      <div className="flex items-center justify-end mt-1.8">
                        <Button
                          text="Cancel"
                          type="submit"
                          className="cancel mr-2.5 text-thinGray font-Poppins text-error font-medium leading-5 cursor-pointer box-border border-cancel  h-2.81 w-5.25  rounded border-none"
                          onClick={() => setIsBillingDetailsModal((prev) => ({ ...prev, billingDetails: false }))}
                        />
                        <Button
                          text="Save"
                          type="submit"
                          className={`text-white font-Poppins text-error font-medium leading-5 btn-save-modal rounded shadow-contactBtn w-5.25 cursor-pointer border-none h-2.81`}
                        />
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </Modal>
          </div>
        </div>

        <div>
          <div className="flex flex-col">
            <Modal
              isOpen={isBillingDetailsModal.cardDetails}
              shouldCloseOnOverlayClick={false}
              onRequestClose={() => setIsBillingDetailsModal((prev) => ({ ...prev, cardDetails: false }))}
              className="w-24.31 pb-12 mx-auto rounded-lg border-fetching-card bg-white shadow-modal"
              style={{
                overlay: {
                  display: 'flex',
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  alignItems: 'center'
                }
              }}
            >
              <div className="flex flex-col p-4">
                <h3 className="text-center font-Inter font-semibold text-xl mt-1.8 text-black leading-6">Payment Information</h3>
                {stripePromise && options.clientSecret && (
                  <Elements stripe={stripePromise} options={options}>
                    <CheckoutForm
                      handleCheckoutFormModal={handleCheckoutFormModal}
                      redirectCondition="add-card"
                      billingDetails={billingDetails}
                      passNewlyAddedCardDetailsToChild={passNewlyAddedCardDetailsToChild}
                    />
                  </Elements>
                )}
              </div>
            </Modal>
          </div>
        </div>
      </div>
    </TabPanel>
  );
};

const billingDetailsScheme = Yup.object().shape({
  billingName: Yup.string()
    .trim('WhiteSpaces are not allowed')
    .min(4, 'Billing Name must be at least 4 characters')
    .max(25, 'Billing Name should not exceed above 25 characters')
    .matches(alphabets_only_regex_with_single_space, 'Numbers and special characters are not allowed')
    .matches(whiteSpace_single_regex, 'White spaces are not allowed')
    .required('Billing Name is a required field')
    .nullable(true),
  billingEmail: Yup.string().email('Must be a valid email').required('Billing Email is required').nullable(true)
});

export default Subscription;
