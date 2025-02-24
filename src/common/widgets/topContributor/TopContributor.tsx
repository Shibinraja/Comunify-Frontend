/* eslint-disable indent */
import React, { FC, useEffect, useState } from 'react';
import { TabSelector } from 'common/tabs/TabSelector';
import { useTabs } from '@/hooks/useTabs';
import ActiveMembersList from '../membersTab/ActiveMembersList';
import infoIcon from '../../../assets/images/info.svg';
import { getLocalWorkspaceId } from '../../../lib/helper';
import { membersWidgetDataService } from '../../../modules/dashboard/services/dashboard.services';
import { MemberWidgetData } from '../../../modules/dashboard/interface/dashboard.interface';
import { WidgetComponentProps } from '../../widgetLayout/WidgetTypes';
import { useAppSelector } from '@/hooks/useRedux';

const TopContributor: FC<WidgetComponentProps> = (props: WidgetComponentProps) => {
  const { isManageMode, removeWidgetFromDashboard, widget, isSidePanelOpen, filters } = props;

  const workspaceId = getLocalWorkspaceId();

  const [selectedTab, setSelectedTab] = useTabs(['topContributor']);
  const [memberWidgetData, setMemberWidgetData] = useState<MemberWidgetData[]>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const defaultTab = 'topContributor';

  const workspaceIdToken = useAppSelector((state) => state.auth.workspaceId);

  const widgetPreviewLocation = window.location.href.includes('/report-details');

  useEffect(() => {
    if (isManageMode === false && !isSidePanelOpen) {
      if (filters?.startDate && filters?.endDate) {
        getMembersWidgetData();
      }
    }
  }, filters && Object.values(filters));

  // eslint-disable-next-line space-before-function-paren
  const getMembersWidgetData = async () => {
    setIsLoading(true);
    const newFilter = { ...filters };
    newFilter['type'] = defaultTab ? defaultTab : (selectedTab as string);
    newFilter['limit'] = 5;
    const data: MemberWidgetData[] = await membersWidgetDataService(workspaceId || workspaceIdToken, newFilter);
    setMemberWidgetData(data);
    setIsLoading(false);
  };

  const handleRemove = () => {
    removeWidgetFromDashboard(widget);
  };

  return (
    <div className={`${!isManageMode ? 'h-full' : 'cursor-grabbing my-6 '}  `}>
      <div className="mb-6">
        <h3 className="font-Poppins font-semibold text-infoData text-infoBlack leading-2.18 dark:text-white">Top Contributors</h3>
      </div>
      <div
        className={`w-full box-border
        ${
          isManageMode ? 'widget-border relative h-full' : 'border-borderPrimary'
        } bg-white dark:bg-secondaryDark dark:text-white rounded-0.6 mt-1.868 border  
         dark:border-borderDark shadow-profileCard  h-[85%]`}
      >
        <div className="w-full mt-6 flex flex-col ">
          <nav>
            <TabSelector
              isActive={selectedTab === 'topContributor'}
              onClick={() => setSelectedTab('topContributor')}
              style={`ml-1.625 mt-0.438 ${isManageMode ? 'text-sm' : 'text-xs'} pb-2  border-transparent`}
              styleActive={'gradient-bottom-border'}
            >
              Top Contributors
              <span className="pl-2 group relative z-10">
                <img src={infoIcon} alt="" />
                <div className="absolute z-10 group-hover:visible invisible mt-4 bg-toolTip text-left p-5 text-white dark:text-white font-Poppins text-email font-normal leading-4 rounded-0.6">
                  Top contributors are the Members <br /> with most number of activities
                </div>
              </span>
            </TabSelector>
            {/* <TabSelector
              isActive={selectedTab === 'active'}
              onClick={() => setSelectedTab('active')}
              style={`ml-1.625 mt-0.438 ${isManageMode ? 'text-sm' : 'text-xs'} pb-2  border-transparent`}
              styleActive={'gradient-bottom-border'}
            >
              Active
            </TabSelector>
            <TabSelector
              isActive={selectedTab === 'inActive'}
              onClick={() => setSelectedTab('inActive')}
              style={`ml-1.625 mt-0.438 ${isManageMode ? 'text-sm' : 'text-xs'} pb-2  border-transparent`}
              styleActive={'gradient-bottom-border'}
            >
              Inactive
            </TabSelector> */}
          </nav>
          <div className={`items-center relative ml-1.661 block section overflow-y-auto ${!widgetPreviewLocation ? 'h-14.375' : ''}`}>
            {!memberWidgetData?.length && !isLoading && !isManageMode && !isSidePanelOpen && (
              <div className="flex items-center justify-center font-Poppins font-normal text-xs text-infoBlack h-full">No data available</div>
            )}

            <ActiveMembersList
              hidden={false}
              membersWidgetData={memberWidgetData ? memberWidgetData : []}
              isLoading={isLoading}
              isManageMode={isManageMode && isManageMode}
              isSidePanelOpen={isSidePanelOpen}
            />
          </div>
        </div>
        {isManageMode && (
          <div
            onClick={handleRemove}
            className="absolute -right-3 bg-widgetClose rounded-full flex items-center justify-center h-6 w-6 text-white text-2xl -top-3 cursor-pointer"
          >
            -
          </div>
        )}
      </div>
    </div>
  );
};

export default TopContributor;
