/* eslint-disable no-unused-vars */
import Button from 'common/button';
import React, { useState } from 'react';
import unsplashIcon from '../../../../assets/images/unsplash.svg';
import slackIcon from '../../../../assets/images/slack.svg';
import { TabPanel } from 'common/tabs/TabPanel';
import Modal from 'react-modal';
import vanillaIcon from '../../../../assets/images/vanilla-forum.svg';
import Input from 'common/input';
import './Integration.css';
import usePlatform from '../../../../hooks/usePlatform';
import {
  ConnectedPlatforms,
  ModalState,
  PlatformIcons,
  PlatformResponse,
  SlackConnectData,
  VanillaForumsConnectData
} from '../../interface/settings.interface';
import { NavigateToConnectPage } from '../../services/settings.services';
import { getLocalWorkspaceId } from '../../../../lib/helper';
import { PlatformConnectResponse } from '../../../../interface/interface';
import { IntegrationResponse, NetworkResponse } from '../../../../lib/api';
import { showErrorToast, showSuccessToast, showWarningToast } from '../../../../common/toast/toastFunctions';
import { useNavigate } from 'react-router';
import { API_ENDPOINT } from '../../../../lib/config';
import { request } from '../../../../lib/request';
import { useDispatch } from 'react-redux';
import settingsSlice from '../../store/slice/settings.slice';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector } from '../../../../hooks/useRedux';
import { AppDispatch, State } from '../../../../store';

Modal.setAppElement('#root');

const Integration: React.FC<{ hidden: boolean }> = ({ hidden }) => {
  const [isModalOpen, setIsModalOpen] = useState<ModalState>({ slack: false, vanillaForums: false });
  // eslint-disable-next-line no-unused-vars
  const [platformIcons, setPlatformIcons] = useState<PlatformIcons>({ slack: undefined, vanillaForums: undefined });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [vanillaForumsData, setVanillaForumsData] = useState<VanillaForumsConnectData>({
    vanillaAccessToken: '',
    vanillaBaseUrl: '',
    workspaceId: ''
  });

  const platformData = usePlatform();
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workspaceId = getLocalWorkspaceId();
  const [isButtonConnect] = useState<boolean>(true);
  const handleVanillaModal = (val: boolean) => {
    setIsModalOpen((prevState) => ({ ...prevState, vanillaForums: val }));
  };

  React.useEffect(() => {
    dispatch(settingsSlice.actions.connectedPlatforms({ workspaceId }));
    if (searchParams.get('code')) {
      const codeParams: null | string = searchParams.get('code');
      if (codeParams !== '') {
        getData(codeParams);
      }
    }
  }, []);

  const { PlatformsConnected } = useAppSelector((state: State) => state.settings);

  const handleModals = (name: string, icon: string) => {
    switch (name) {
      case 'slack':
        setPlatformIcons((prevState) => ({ ...prevState, slack: icon }));
        NavigateToConnectPage();
        break;
      case 'vanilla':
        setPlatformIcons((prevState) => ({ ...prevState, vanillaForums: icon }));
        setIsModalOpen((prevState) => ({ ...prevState, vanillaForums: true }));
        break;
      default:
        break;
    }
  };

  // eslint-disable-next-line space-before-function-paren
  const getData = async (codeParams: string | null) => {
    try {
      setIsModalOpen((prevState) => ({ ...prevState, slack: true }));
      const body: SlackConnectData = {
        code: codeParams,
        workspaceId
      };
      const response: IntegrationResponse<PlatformConnectResponse> = await request.post(`${API_ENDPOINT}/v1/slack/connect`, body);
      localStorage.setItem('workspacePlatformSettingsId', response?.data?.data?.id);
      if (response) {
        setIsModalOpen((prevState) => ({ ...prevState, slack: false }));
        navigate(`/${workspaceId}/settings/complete-setup`, { state: { workspacePlatformSettingsId: response?.data?.data?.id } });
      } else {
        showErrorToast('Integration failed');
      }
    } catch {
      showErrorToast('Integration failed');
    }
  };

  // eslint-disable-next-line space-before-function-paren
  const sendVanillaData = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsLoading(true);
    try {
      event.preventDefault();
      const body: VanillaForumsConnectData = {
        vanillaBaseUrl: vanillaForumsData.vanillaBaseUrl,
        vanillaAccessToken: vanillaForumsData.vanillaAccessToken,
        workspaceId
      };
      const connectResponse: IntegrationResponse<PlatformConnectResponse> = await request.post(`${API_ENDPOINT}/v1/vanilla/connect`, body);
      if (connectResponse?.data?.message?.toLocaleLowerCase().trim() == 'already connected') {
        showWarningToast('This platform is already connected to your workspace');
        setIsLoading(false);
      }
      if (connectResponse?.data?.data?.id) {
        showSuccessToast('Integration in progress');
        try {
          const completeSetupResponse: NetworkResponse<string> = await request.post(`${API_ENDPOINT}/v1/vanilla/complete-setup`, {
            workspaceId,
            workspacePlatformSettingsId: connectResponse?.data?.data?.id
          });
          if (completeSetupResponse) {
            dispatch(settingsSlice.actions.connectedPlatforms({ workspaceId }));
            showSuccessToast('Successfully integrated');
            setIsLoading(false);
            setIsModalOpen((prevState) => ({ ...prevState, vanillaForums: false }));
          }
        } catch (error) {
          showErrorToast('Integration Failed');
          setIsLoading(false);
        }
      }
    } catch (error) {
      showErrorToast('Integration Failed');
      setIsLoading(false);
    }
  };

  const connectedBtnClassName = `bg-connectButton shadow-contactCard font-Poppins text-white font-medium leading-5 ${
    isLoading ? 'opacity-50 cursor-not-allowed ' : ''
  }
  text-error mt-0.81 rounded h-8 w-6.56 cursor-pointer hover:shadow-buttonShadowHover transition ease-in duration-300 btn-gradient`;
  const disConnectedBtnClassName = `btn-disconnect-gradient shadow-contactCard font-Poppins text-white font-medium leading-5 text-error mt-0.81
     rounded h-8 w-6.56 cursor-pointer hover:shadow-buttonShadowHover transition ease-in duration-300`;

  return (
    <TabPanel hidden={hidden}>
      <div className="settings-integration container mt-2.62 pb-20">
        <h3 className="font-Poppins text-infoBlack font-semibold text-base leading-1.43">Connected Integrations</h3>
        <div className="flex mt-1.8 flex-wrap w-full pb-1.68 border-b border-bottom-card">
          {PlatformsConnected?.map((data: ConnectedPlatforms) => (
            <div
              key={`${data?.id + data?.name}`}
              className="app-input-card-border shadow-integrationCardShadow w-8.5 h-11.68 rounded-0.6 box-border bg-white flex flex-col items-center justify-center mr-5"
            >
              <div className="flex items-center justify-center h-16 w-16 bg-center bg-cover bg-subIntegrationGray">
                <img src={data?.platform?.platformLogoUrl} alt="" className="h-2.31" />
              </div>
              <div className="text-integrationGray leading-1.31 text-trial font-Poppins font-semibold mt-2">{data?.platform?.name}</div>
              <Button
                type="button"
                text={isButtonConnect ? 'Disconnect' : 'Connect'}
                className={isButtonConnect ? disConnectedBtnClassName : connectedBtnClassName}
              />
            </div>
          ))}
        </div>
        <div className="pending-connect mt-1.8">
          <h3 className="font-Poppins text-infoBlack font-semibold text-base leading-1.43">Integrations</h3>
          <p className="font-Poppins font-normal text-error leading-1.43 mt-0.5">
            Choose from any of the following data sources to connect with and see what your community members are up to!
          </p>

          <div className="flex mt-1.8 flex-wrap w-full">
            {platformData?.map((data: PlatformResponse) => (
              <div
                key={`${data?.id + data?.name}`}
                className="app-input-card-border shadow-integrationCardShadow w-8.5 h-11.68 rounded-0.6 box-border bg-white flex flex-col items-center justify-center mr-5"
              >
                <div className="flex flex-wrap items-center justify-center h-16 w-16 bg-center bg-cover bg-subIntegrationGray">
                  <img src={data?.platformLogoUrl} alt="" className="h-2.31" />
                </div>
                <div className="text-integrationGray leading-1.31 text-trial font-Poppins font-semibold mt-2">{data?.name}</div>
                <Button
                  type="button"
                  text="Connect"
                  className={!isButtonConnect ? disConnectedBtnClassName : connectedBtnClassName}
                  onClick={() => handleModals(data?.name.toLocaleLowerCase().trim(), data?.platformLogoUrl)}
                />
              </div>
            ))}

            <div className="app-input-card-border shadow-integrationCardShadow w-8.5 h-11.68 rounded-0.6 box-border bg-white flex flex-col items-center justify-center mr-5">
              <div className="flex items-center justify-center h-16 w-16 bg-center bg-cover bg-subIntegrationGray">
                <img src={unsplashIcon} alt="" className="h-2.31" />
              </div>
              <div className="text-integrationGray leading-1.31 text-trial font-Poppins font-semibold mt-2">Khoros</div>
              <Button
                disabled={isLoading ? true : false}
                type="button"
                text="Coming soon"
                className="bg-black shadow-contactCard font-Poppins cursor-none text-white font-medium leading-5 text-error mt-0.81 rounded-full h-6 w-6.56"
              />
            </div>
          </div>

          <Modal
            isOpen={isModalOpen.slack}
            shouldCloseOnOverlayClick={true}
            onRequestClose={() => setIsModalOpen((prevState) => ({ ...prevState, slack: false }))}
            className="h-14.56 w-22.31 shadow-modal flex items-center justify-center rounded-lg border-fetching-card mx-auto  bg-white outline-none"
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
            <div className="loading">
              <div className="flex flex-col items-center justify-center  ">
                <div className=" bg-no-repeat bg-center bg-contain ">
                  <img src={slackIcon} alt="" className="rounded-full w-2.68 h-2.68" />
                </div>
                <div className="mt-4 text-integrationGray font-Poppins fomt-normal text-desc leadind-1.68">
                  Fetching data from <span className="text-black font-normal">Slack</span>
                </div>
                <div className="mt-1.8">
                  <div className="dot-pulse">
                    <div className="dot-pulse__dot"></div>
                  </div>
                </div>
              </div>
            </div>
          </Modal>

          <Modal
            isOpen={isModalOpen.vanillaForums}
            shouldCloseOnOverlayClick={false}
            onRequestClose={() => setIsModalOpen((prevState) => ({ ...prevState, vanillaForums: false }))}
            className="w-24.31 pb-12 mx-auto rounded-lg border-integration-modal bg-white shadow-modal outline-none"
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
            <div className="vanilla">
              <h3 className="flex items-center justify-center pt-9 font-Inter text-xl font-semibold leading-6">
                <img src={vanillaIcon} alt="" className="px-2.5" />
                integrate <span className="font-normal px-2">Vanilla Forums</span>
              </h3>
              <div className="flex flex-col px-[1.875rem] pt-9">
                <form>
                  <div className="form-group">
                    <label htmlFor="siteUrl" className="font-Poppins font-normal text-infoBlack text-sm leading-5">
                      Site URL*
                    </label>
                    <h1 className="font-Inter font-normal text-error leading-7 text-vanillaDescription">
                      Enter the full URL to your Vanilla site.<span className="text-tag cursor-pointer hover:underline"> Learn more.</span>
                    </h1>
                    <Input
                      type="text"
                      placeholder="Enter URL"
                      label="Site URL"
                      id="siteUrlId"
                      name="SiteUrl"
                      value={vanillaForumsData?.vanillaBaseUrl}
                      onChange={(e) => setVanillaForumsData((prevState) => ({ ...prevState, vanillaBaseUrl: e.target.value }))}
                      className="h-2.81 pr-3.12 rounded-md border-app-result-card-border mt-[0.4375rem] bg-white p-2.5 focus:outline-none placeholder:font-normal placeholder:text-thinGray placeholder:text-sm placeholder:leading-6 placeholder:font-Poppins font-Poppins box-border"
                    />
                  </div>
                  <div className="form-group pt-1.12">
                    <label htmlFor="accessToken" className="font-Poppins font-normal text-infoBlack text-sm leading-5">
                      Access Token*
                    </label>
                    <h1 className="font-Inter font-normal text-error leading-7 text-vanillaDescription">
                      You can learn how to create an access Token<span className="text-tag cursor-pointer hover:underline"> here.</span>
                    </h1>
                    <Input
                      type="text"
                      placeholder="Enter access token"
                      label="Access Token"
                      id="accessTokenId"
                      name="accessToken"
                      value={vanillaForumsData?.vanillaAccessToken}
                      onChange={(e) => setVanillaForumsData((prevState) => ({ ...prevState, vanillaAccessToken: e.target.value }))}
                      className="h-2.81 pr-3.12 rounded-md border-app-result-card-border mt-[0.4375rem] bg-white p-2.5 focus:outline-none placeholder:font-normal placeholder:text-thinGray placeholder:text-sm placeholder:leading-6 placeholder:font-Poppins font-Poppins box-border"
                    />
                  </div>
                  <div className="flex justify-end pt-[1.875rem]">
                    <Button
                      text="Cancel"
                      type="submit"
                      className="cancel mr-2.5 text-thinGray font-Poppins text-error font-medium leading-5 cursor-pointer box-border border-cancel  h-2.81 w-5.25  rounded border-none"
                      onClick={() => handleVanillaModal(false)}
                    />
                    <Button
                      text="Save"
                      type="submit"
                      disabled={isLoading ? true : false}
                      onClick={(e) => sendVanillaData(e)}
                      className={`text-white ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      } font-Poppins text-error font-medium leading-5 btn-save-modal
                       cursor-pointer rounded shadow-contactBtn w-5.25 border-none h-2.81`}
                    />
                  </div>
                </form>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </TabPanel>
  );
};

export default Integration;
