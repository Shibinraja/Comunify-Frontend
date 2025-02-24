import Button from 'common/button';
import { SalesforceCommunities, SalesforceConnectResponse } from 'interface/interface';
import { useEffect, useState } from 'react';
import { NavigateFunction, useLocation, useNavigate } from 'react-router';
import salesForce from '../../../../assets/images/salesforce.png';
import dropdownIcon from '../../../../assets/images/filter-dropdown.svg';
import { showErrorToast, showSuccessToast, showWarningToast } from '../../../../common/toast/toastFunctions';
import { NetworkResponse } from '../../../../lib/api';
import { API_ENDPOINT } from '../../../../lib/config';
import { getLocalWorkspaceId } from '../../../../lib/helper';
import { request } from '../../../../lib/request';

const SalesForceSelectCommunity: React.FC = () => {
  const [isCommunityActive, setIsCommunityActive] = useState<boolean>(false);
  const [community, setCommunity] = useState('');
  const [communitiesDetails, setCommunitiesDetails] = useState<SalesforceCommunities[]>([]);
  const [selectedCommunityDetails, setSelectedCommunityDetails] = useState<SalesforceCommunities>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate: NavigateFunction = useNavigate();
  const location: Location | any = useLocation();
  const workspaceId: string = getLocalWorkspaceId();

  interface CompleteSetupBody {
    workspacePlatformAuthSettingsId: string | null;
    workspaceId: string;
    communityId: string;
    communityName: string;
    communityUrl: string;
  }

  const connectResponse: SalesforceConnectResponse = location?.state?.salesforceConnectResponse;
  const communitiesDataArray: SalesforceCommunities[] = connectResponse?.communities?.map((data: SalesforceCommunities) => ({
    communityName: data?.communityName,
    communityId: data?.communityId,
    communityUrl: data?.communityUrl
  }));

  useEffect(() => {
    if (communitiesDataArray?.length) {
      setCommunitiesDetails(communitiesDataArray);
    } else {
      showWarningToast('No Communities to Select');
    }
  }, [connectResponse]);

  const selectCommunity = (communityName: string) => {
    setCommunity(communityName);
    const selectedCommunityData: SalesforceCommunities | undefined = communitiesDetails.filter(
      (data: SalesforceCommunities) => data?.communityName.toLocaleLowerCase().trim() === communityName.toLocaleLowerCase().trim()
    )[0];
    if (selectedCommunityData) {
      setSelectedCommunityDetails(selectedCommunityData);
    }
  };

  //  eslint-disable-next-line space-before-function-paren
  const salesforceCompleteSetup = async () => {
    setIsLoading(true);
    try {
      const body: CompleteSetupBody = {
        workspaceId,
        workspacePlatformAuthSettingsId: connectResponse?.id,
        communityName: community,
        communityUrl: selectedCommunityDetails ? selectedCommunityDetails?.communityUrl : '',
        communityId: selectedCommunityDetails ? selectedCommunityDetails?.communityId : ''
      };
      const response: NetworkResponse<string> = await request.post(`${API_ENDPOINT}/v1/salesforce/complete-setup`, body);
      if (response?.data?.message) {
        showSuccessToast('Successfully integrated');
        setIsLoading(false);
        navigate(`/${workspaceId}/settings`);
      } else {
        showErrorToast('Integration failed');
        setIsLoading(false);
      }
    } catch {
      showErrorToast('Integration Failed');
      setIsLoading(false);
    }
  };

  const navigateToSettingsPage = (): void => {
    navigate({ pathname: '' });
    navigate(`/${workspaceId}/settings`);
  };

  return (
    <div className="pt-20">
      <div className="flex flex-col w-full">
        <div>
          <img src={salesForce} alt="" className="w-16 h-10" />
        </div>
        <div className="font-Inter font-bold text-signIn leading-7 text-neutralBlack pt-3">Manage Salesforce Integration</div>
        <div className="settings-card px-7 py-10 mt-6 box-border border-table rounded-0.9 shadow-paymentSubscriptionCard">
          <div className="flex flex-col pb-5">
            <div className="flex justify-end font-Poppins font-semibold text-base text-slimGray leading-6">Salesforce</div>
          </div>
          <div className="flex justify-between py-5 border-top-card">
            <div className="font-Poppins font-semibold text-base text-manageTitle leading-6">Status</div>
            <div className="font-Poppins font-semibold text-slackStatus text-base leading-6">Connected</div>
          </div>
          <div className="flex justify-between py-5 border-top-card">
            <div className="font-Poppins font-semibold text-base text-manageTitle leading-6">Community</div>
            <div className="font-Poppins font-semibold text-base text-slimGray leading-6 capitalize"> {community ? community : 'Not Selected'}</div>
          </div>
        </div>

        <div className="py-6">
          <div className="mt-5 flex flex-col w-80" onClick={() => setIsCommunityActive(!isCommunityActive)}>
            <label htmlFor="name" className="text-base font-Poppins text-infoBlack font-medium leading-1.31">
              Select Community
            </label>
            <div className="relative w-20.5 2xl:w-full h-3.06 app-result-card-border flex items-center px-3 mt-2 shadow-ChannelInput rounded-0.3 font-Poppins font-normal text-trial text-thinGray leading-1.31 cursor-pointer ">
              {community ? community : 'Select'}
              <div className="absolute right-4">
                <img src={dropdownIcon} alt="" className={isCommunityActive ? 'rotate-0' : 'rotate-180'} />
              </div>
            </div>
            {isCommunityActive && (
              <div className="flex flex-col app-result-card-border box-border w-20.5 rounded-0.3 shadow-reportInput z-10 cursor-pointer bg-white min-h-[50px] max-h-60 overflow-auto">
                {communitiesDetails?.map((options: SalesforceCommunities) => (
                  <ul
                    className="cursor-pointer hover:bg-signUpDomain  transition ease-in duration-100 "
                    onClick={() => {
                      selectCommunity(options?.communityName);
                    }}
                    key={`${options?.communityId + Math.random()}`}
                  >
                    <li value={community} className="text-searchBlack font-Poppins font-normal leading-1.31 text-trial p-3 capitalize">
                      {options?.communityName}
                    </li>
                  </ul>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            text="Cancel"
            type="submit"
            className="mr-2.5 text-thinGray font-Poppins text-error font-medium leading-5 cursor-pointer box-border border-cancel  w-5.25 h-2.81  rounded border-none"
            onClick={() => navigateToSettingsPage()}
          />
          <Button
            text="Complete Setup"
            type="submit"
            disabled={isLoading ? true : false}
            onClick={() => {
              if (!community) {
                showErrorToast('Please select a community');
              } else {
                salesforceCompleteSetup();
              }
            }}
            className={`text-white font-Poppins text-error font-medium ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } leading-5 btn-save-modal rounded shadow-contactBtn py-3 px-4 border-none h-2.81`}
          />
        </div>
      </div>
    </div>
  );
};

export default SalesForceSelectCommunity;
