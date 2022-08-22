import Button from 'common/button';
import React, { useState } from 'react';
import unsplashIcon from '../../../../assets/images/unsplash.svg';
import slackIcon from '../../../../assets/images/slack.svg';
import { TabPanel } from 'common/tabs/TabPanel';
import Modal from 'react-modal';
import vanillaIcon from '../../../../assets/images/vanilla-forum.svg';
import Input from 'common/input';
Modal.setAppElement('#root');

const Integration: React.FC<{ hidden: boolean }> = ({ hidden }) => {
  const [isButtonConnect] = useState<boolean>(true);
  const [isVanillaModalOpen, setVanillaModalOpen] = useState<boolean>(false);
  const handleVanillaModal = (val: boolean) => {
    setVanillaModalOpen(val);
  };
  const connectedBtnClassName =
    'bg-connectButton shadow-contactCard font-Poppins text-white font-medium leading-5 text-error mt-0.81 rounded h-8 w-6.56 cursor-pointer hover:shadow-buttonShadowHover transition ease-in duration-300 btn-gradient';
  const disConnectedBtnClassName =
    'btn-disconnect-gradient shadow-contactCard font-Poppins text-white font-medium leading-5 text-error mt-0.81 rounded h-8 w-6.56 cursor-pointer hover:shadow-buttonShadowHover transition ease-in duration-300';

  return (
    <TabPanel hidden={hidden}>
      <div className="settings-integration container mt-2.62 pb-20">
        <h3 className="font-Poppins text-infoBlack font-semibold text-base leading-1.43">Connected Integrations</h3>
        <div className="flex mt-1.8 flex-wrap w-full pb-1.68 border-b border-bottom-card">
          <div className="app-input-card-border shadow-integrationCardShadow w-8.5 h-11.68 rounded-0.6 box-border bg-white flex flex-col items-center justify-center mr-5">
            <div className="flex items-center justify-center h-16 w-16 bg-center bg-cover bg-subIntegrationGray">
              <img src={unsplashIcon} alt="" className="h-2.31" />
            </div>
            <div className="text-integrationGray leading-1.31 text-trial font-Poppins font-semibold mt-2">Khoros</div>
            <Button
              type="button"
              text={isButtonConnect ? 'Disconnect' : 'Connect'}
              className={isButtonConnect ? disConnectedBtnClassName : connectedBtnClassName}
            />
          </div>
          <div className="app-input-card-border shadow-integrationCardShadow w-8.5 h-11.68 rounded-0.6 box-border bg-white flex flex-col items-center justify-center mr-5">
            <div className="flex items-center justify-center h-16 w-16 bg-center bg-cover bg-subIntegrationGray">
              <img src={slackIcon} alt="" className="h-2.31" />
            </div>
            <div className="text-integrationGray leading-1.31 text-trial font-Poppins font-semibold mt-2">HIgher Logi</div>
            <Button type="button" text="Disconnect" className={isButtonConnect ? disConnectedBtnClassName : connectedBtnClassName} />
          </div>
        </div>
        <div className="pending-connect mt-1.8">
          <h3 className="font-Poppins text-infoBlack font-semibold text-base leading-1.43">Integrations</h3>
          <p className="font-Poppins font-normal text-error leading-1.43 mt-0.5">
            Choose from any of the following data sources to connect with and see what your community members are up to!
          </p>
          <div className="flex mt-1.8 flex-wrap w-full">
            <div className="app-input-card-border shadow-integrationCardShadow w-8.5 h-11.68 rounded-0.6 box-border bg-white flex flex-col items-center justify-center mr-5">
              <div className="flex flex-wrap items-center justify-center h-16 w-16 bg-center bg-cover bg-subIntegrationGray">
                <img src={unsplashIcon} alt="" className="h-2.31" />
              </div>
              <div className="text-integrationGray leading-1.31 text-trial font-Poppins font-semibold mt-2">Khoros</div>
              <Button type="button" text="Connect" className={!isButtonConnect ? disConnectedBtnClassName : connectedBtnClassName} />
            </div>
            <div className="app-input-card-border shadow-integrationCardShadow w-8.5 h-11.68 rounded-0.6 box-border bg-white flex flex-col items-center justify-center mr-5">
              <div className="flex items-center justify-center h-16 w-16 bg-center bg-cover bg-subIntegrationGray">
                <img src={vanillaIcon} alt="" className="h-2.31" />
              </div>
              <div className="text-integrationGray leading-1.31 text-trial font-Poppins font-semibold mt-2">Vanilla forums</div>
              <Button
                type="button"
                text="Connect"
                className={!isButtonConnect ? disConnectedBtnClassName : connectedBtnClassName}
                onClick={() => handleVanillaModal(true)}
              />
              <Modal
                isOpen={isVanillaModalOpen}
                shouldCloseOnOverlayClick={false}
                onRequestClose={() => handleVanillaModal(false)}
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
                          className="text-white font-Poppins text-error font-medium leading-5 btn-save-modal cursor-pointer rounded shadow-contactBtn w-5.25 border-none h-2.81"
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </Modal>
            </div>
            <div className="app-input-card-border shadow-integrationCardShadow w-8.5 h-11.68 rounded-0.6 box-border bg-white flex flex-col items-center justify-center mr-5">
              <div className="flex items-center justify-center h-16 w-16 bg-center bg-cover bg-subIntegrationGray">
                <img src={unsplashIcon} alt="" className="h-2.31" />
              </div>
              <div className="text-integrationGray leading-1.31 text-trial font-Poppins font-semibold mt-2">Khoros</div>
              <Button
                type="button"
                text="Coming soon"
                className="bg-black shadow-contactCard font-Poppins cursor-none text-white font-medium leading-5 text-error mt-0.81 rounded-full h-6 w-6.56"
              />
            </div>
          </div>
        </div>
      </div>
    </TabPanel>
  );
};

export default Integration;
