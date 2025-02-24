/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import useDebounce from '@/hooks/useDebounce';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import useSkeletonLoading from '@/hooks/useSkeletonLoading';
import { convertEndDate, convertStartDate, getLocalWorkspaceId } from '@/lib/helper';
import Button from 'common/button';
import { PlatformResponse, TagResponseData } from 'modules/settings/interface/settings.interface';
import settingsSlice from 'modules/settings/store/slice/settings.slice';
import { ChangeEvent, FC, useEffect, useMemo, useRef, useState } from 'react';
import DatePicker, { ReactDatePicker } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import calendarIcon from '../../../assets/images/calandar.svg';
import searchIcon from '../../../assets/images/search.svg';
import downArrow from '../../../assets/images/sub-down-arrow.svg';
import dropdownIcon from '../../../assets/images/Vector.svg';
import usePlatform from '../../../hooks/usePlatform';
import { MemberFilterDropDownEnum, MemberTypesProps } from '../interface/members.interface';
import membersSlice from '../store/slice/members.slice';
import './Members.css';

const MembersFilter: FC<MemberTypesProps> = ({ page, limit, memberFilterExport, searchText, filteredDate, setPage }) => {
  const [activateFilter, setActivateFilter] = useState<{
    isPlatformActive: boolean;
    isTagActive: boolean;
    isActiveBetween: boolean;
    isLocationActive: boolean;
    isOrganizationActive: boolean;
  }>({
    isPlatformActive: false,
    isTagActive: false,
    isActiveBetween: false,
    isLocationActive: false,
    isOrganizationActive: false
  });
  const [isFilterDropdownActive, setIsFilterDropdownActive] = useState<boolean>(false);
  const [checkedPlatform, setCheckedPlatform] = useState<Record<string, unknown>>({});
  const [checkedTags, setCheckedTags] = useState<Record<string, unknown>>({});
  const [checkedLocation, setCheckedLocation] = useState<Record<string, unknown>>({});
  const [checkedOrganization, setCheckedOrganization] = useState<Record<string, unknown>>({});
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [tagSearchText, setTagSearchText] = useState<string>('');
  const [locationSearchText, setLocationSearchText] = useState<string>('');
  const [filterCount, setFilterCount] = useState<number>(0);
  const [saveRefObject, setSaveRefObject] = useState<HTMLDivElement | null>(null);

  const [organizationSearchText, setOrganizationSearchText] = useState<string>('');
  const datePickerRefStart = useRef<ReactDatePicker>(null);
  const datePickerRefEnd = useRef<ReactDatePicker>(null);

  const workspaceId = getLocalWorkspaceId();
  const dispatch = useAppDispatch();
  const dropDownRef = useRef<HTMLDivElement | null>(null);
  const { membersLocationFilterResponse, membersOrganizationFilterResponse } = useAppSelector((state) => state.members);
  const { data: TagFilterResponse } = useAppSelector((state) => state.settings.TagFilterResponse);
  const memberColumnsLoader = useSkeletonLoading(membersSlice.actions.membersList.type);
  const { PlatformFilterResponse } = usePlatform();
  const debouncedLocationValue = useDebounce(locationSearchText, 300);
  const debouncedOrganizationValue = useDebounce(organizationSearchText, 300);
  const debouncedTagValue = useDebounce(tagSearchText, 300);

  const MemberFilterList = Object.values(checkedPlatform)
    .concat(Object.values(checkedTags))
    .concat(Object.values(checkedLocation))
    .concat(Object.values(checkedOrganization));

  // Returns the debounced value of the search text.
  useEffect(() => {
    if (debouncedLocationValue) {
      getFilteredMembersFilterList(debouncedLocationValue);
    }
  }, [debouncedLocationValue]);

  useEffect(() => {
    if (debouncedOrganizationValue) {
      getFilteredMembersFilterList('', debouncedOrganizationValue);
    }
  }, [debouncedOrganizationValue]);

  useEffect(() => {
    if (debouncedTagValue) {
      getFilteredMembersTagList(1, debouncedTagValue);
    }
  }, [debouncedTagValue]);

  //

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    setSaveRefObject(dropDownRef.current);
    // dispatch(settingsSlice.actions.platformData({ workspaceId }));
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const handleOutsideClick = (event: MouseEvent) => {
    if (dropDownRef && dropDownRef.current && !dropDownRef.current.contains(event.target as Node)) {
      setIsFilterDropdownActive(false);
    }
  };

  const handleFilterDropdown = (): void => {
    setIsFilterDropdownActive((prev) => !prev);
    setActivateFilter((prevList) => ({ ...prevList, isPlatformActive: true }));
  };

  const handleFilterDropDownStatus = (type: string) => {
    if (type === MemberFilterDropDownEnum.platform) {
      setActivateFilter({
        isActiveBetween: false,
        isTagActive: false,
        isLocationActive: false,
        isOrganizationActive: false,
        isPlatformActive: activateFilter.isPlatformActive ? false : true
      });
    }

    if (type === MemberFilterDropDownEnum.tag) {
      setActivateFilter({
        isActiveBetween: false,
        isTagActive: activateFilter.isTagActive ? false : true,
        isLocationActive: false,
        isOrganizationActive: false,
        isPlatformActive: false
      });
    }

    if (type === MemberFilterDropDownEnum.activeBetween) {
      setActivateFilter({
        isActiveBetween: activateFilter.isActiveBetween ? false : true,
        isTagActive: false,
        isLocationActive: false,
        isOrganizationActive: false,
        isPlatformActive: false
      });
    }

    if (type === MemberFilterDropDownEnum.location) {
      setActivateFilter({
        isActiveBetween: false,
        isTagActive: false,
        isLocationActive: activateFilter.isLocationActive ? false : true,
        isOrganizationActive: false,
        isPlatformActive: false
      });
    }

    if (type === MemberFilterDropDownEnum.organization) {
      setActivateFilter({
        isActiveBetween: false,
        isTagActive: false,
        isLocationActive: false,
        isOrganizationActive: activateFilter.isOrganizationActive ? false : true,
        isPlatformActive: false
      });
    }
  };

  const handlePlatformsCheckBox = (event: ChangeEvent<HTMLInputElement>) => {
    const platform: string = event.target.name;
    setCheckedPlatform((preValue) => ({ ...preValue, [platform]: event.target.checked }));
  };

  const handleTagsCheckBox = (event: ChangeEvent<HTMLInputElement>) => {
    const tag: string = event.target.name;
    setCheckedTags((preValue) => ({ ...preValue, [tag]: event.target.checked }));
  };

  const handleLocationCheckBox = (event: ChangeEvent<HTMLInputElement>) => {
    const location: string = event.target.name;
    setCheckedLocation((preValue) => ({ ...preValue, [location]: event.target.checked }));
  };

  const handleOrganizationCheckBox = (event: ChangeEvent<HTMLInputElement>) => {
    const organization: string = event.target.name;
    setCheckedOrganization((preValue) => ({ ...preValue, [organization]: event.target.checked }));
  };

  const handleTagSearchTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const searchText: string = event.target.value;
    if (!searchText) {
      getFilteredMembersTagList(1, '');
    }
    setTagSearchText(searchText);
  };

  const handleLocationSearchTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const searchText: string = event.target.value;
    if (!searchText) {
      getFilteredMembersFilterList(searchText);
    }
    setLocationSearchText(searchText);
  };

  useEffect(() => {
    handleFilterCount();
  }, [checkedPlatform, checkedLocation, checkedOrganization, checkedTags, startDate, endDate]);

  const handleFilterCount = () => {
    const getFilterCount = (filterObject: any) =>
      Object.entries(filterObject).reduce((preValue, arr) => {
        let count: number = preValue;
        if (arr[1] === true) {
          count++;
        }
        return count;
      }, 0);

    const dateEntered = startDate || endDate ? 1 : 0;

    const count =
      dateEntered +
      getFilterCount(checkedPlatform) +
      getFilterCount(checkedLocation) +
      getFilterCount(checkedOrganization) +
      getFilterCount(checkedTags);
    setFilterCount(count);
  };

  const handleOrganizationSearchTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const searchText: string = event.target.value;
    if (!searchText) {
      getFilteredMembersFilterList('', searchText);
    }
    setOrganizationSearchText(searchText);
  };

  const getFilteredMembersTagList = (pageNumber: number, tagText: string) => {
    dispatch(
      settingsSlice.actions.tagFilterData({
        settingsQuery: {
          page: pageNumber,
          limit,
          tags: { searchedTags: tagText, checkedTags: '' }
        },
        workspaceId: workspaceId!
      })
    );
  };

  const selectActiveBetweenDate = (event: ChangeEvent<Date>, date: Date, dateTime: string) => {
    event.stopPropagation();
    dropDownRef.current = saveRefObject;
    if (dateTime === 'start') {
      setStartDate(date);
      setIsFilterDropdownActive(true);
    }

    if (dateTime === 'end') {
      setEndDate(date);
      setIsFilterDropdownActive(true);
    }
  };

  const handleClickDatePickerIcon = (type: string) => {
    if (type === 'start') {
      const datePickerElement = datePickerRefStart.current;
      datePickerElement!.setFocus();
    }
    if (type === 'end') {
      const datePickerElement = datePickerRefEnd.current;
      datePickerElement!.setFocus();
    }
  };

  // Function to dispatch the search text to hit api of member filter list.
  const getFilteredMembersFilterList = (locationText: string, organizationText?: string) => {
    if (typeof locationText === 'string') {
      dispatch(
        membersSlice.actions.membersLocationFilter({
          membersQuery: { location: { searchedLocation: locationText, checkedLocation: '' } },
          workspaceId: workspaceId!
        })
      );
    }

    if (typeof organizationText === 'string') {
      dispatch(
        membersSlice.actions.membersOrganizationFilter({
          membersQuery: { organization: { searchedOrganization: organizationText, checkedOrganization: '' } },
          workspaceId: workspaceId!
        })
      );
    }
  };

  const disableApplyBtn = useMemo(() => {
    if (startDate === undefined && endDate === undefined && MemberFilterList.length === 0) {
      return true;
    }

    if (startDate && endDate) {
      return false;
    }

    if (startDate || endDate) {
      return true;
    }

    return false;
  }, [startDate, endDate, MemberFilterList]);

  const submitFilterChange = (): void => {
    const checkPlatform: Array<string> = [];
    const checkTags: Array<string> = [];
    const checkOrganization: Array<string> = [];
    const checkLocation: Array<string> = [];

    // Condition to check if all the filters are not selected to disable the apply btn in filter.
    const checkMemberFilterList = MemberFilterList.every((filter: unknown) => filter === false);

    if (checkMemberFilterList) {
      setCheckedPlatform({});
      setCheckedTags({});
      setCheckedLocation({});
      setCheckedOrganization({});
    }
    if (Object.keys(checkedPlatform).length > 0) {
      Object.keys(checkedPlatform).map((platform: string) => {
        if (checkedPlatform[platform] === true) {
          checkPlatform.push(platform);
        }
      });
    }

    if (Object.keys(checkedTags).length > 0) {
      Object.keys(checkedTags).map((tag: string) => {
        if (checkedTags[tag] === true) {
          checkTags.push(tag);
        }
      });
    }

    if (Object.keys(checkedOrganization).length > 0) {
      Object.keys(checkedOrganization).map((organization: string) => {
        if (checkedOrganization[organization] === true) {
          checkOrganization.push(organization);
        }
      });
    }

    if (Object.keys(checkedLocation).length > 0) {
      Object.keys(checkedLocation).map((location: string) => {
        if (checkedLocation[location] === true) {
          checkLocation.push(location);
        }
      });
    }

    memberFilterExport({
      checkTags: checkTags.toString(),
      checkPlatform: checkPlatform.toString(),
      checkOrganization: checkOrganization.toString(),
      checkLocation: checkLocation.toString(),
      endDate: endDate && convertEndDate(endDate),
      startDate: startDate && convertStartDate(startDate)
    });
    if (!disableApplyBtn) {
      dispatch(
        membersSlice.actions.membersList({
          membersQuery: {
            page,
            limit,
            search: searchText,
            tags: { searchedTags: '', checkedTags: checkTags.toString() },
            platforms: checkPlatform.toString(),
            organization: { searchedOrganization: '', checkedOrganization: checkOrganization.toString() },
            location: { searchedLocation: '', checkedLocation: checkLocation.toString() },
            'lastActivity.lte': endDate && convertEndDate(endDate),
            'lastActivity.gte': startDate && convertStartDate(startDate),
            'createdAT.gte': filteredDate.filterStartDate,
            'createdAT.lte': filteredDate.filterEndDate
          },
          workspaceId: workspaceId!
        })
      );
      setPage(1);
    }
    handleFilterDropdown();
  };

  return (
    <div className="box-border cursor-pointer rounded-0.6 shadow-contactCard app-input-card-border relative " ref={dropDownRef}>
      <div
        className="flex h-3.06  items-center justify-between px-5 "
        onClick={() => {
          handleFilterDropdown();
        }}
      >
        <div className="box-border flex rounded-0.6 shadow-contactCard font-Poppins font-semibold text-card text-memberDay leading-1.12">
          Filters
          <p className="ml-1 bg-signUpDomain px-2 w-content rounded-lg text-memberDay">{`${filterCount}`}</p>
        </div>
        <div>
          <img src={dropdownIcon} alt="" className={isFilterDropdownActive ? 'rotate-180' : 'rotate-0'} />
        </div>
      </div>
      {isFilterDropdownActive && (
        <div className="absolute w-16.56 pb-0 bg-white border z-40 rounded-0.3">
          <div className="flex flex-col pb-5">
            <div
              className="flex justify-between items-center drop w-full box-border bg-signUpDomain h-3.06  px-3 mx-auto  cursor-pointer"
              onClick={() => {
                handleFilterDropDownStatus('platform');
              }}
            >
              <div className="text-searchBlack font-Poppins text-trial leading-1.31 font-semibold">Platform</div>
              <div>
                <img src={downArrow} alt="" className={activateFilter.isPlatformActive ? 'rotate-0' : 'rotate-180'} />
              </div>
            </div>
            {activateFilter.isPlatformActive && (
              <div className="flex flex-col gap-y-5 px-3 py-3 max-h-[11.25rem] overflow-y-scroll">
                {PlatformFilterResponse &&
                  PlatformFilterResponse.map(
                    (platform: PlatformResponse) =>
                      platform?.isConnected && (
                        <div className="flex items-center" key={platform.id}>
                          <div className="mr-2">
                            <input
                              type="checkbox"
                              className="checkbox"
                              id={platform.id as string}
                              name={platform.name as string}
                              checked={(checkedPlatform[platform.name] as boolean) || false}
                              onChange={(e) => {
                                handlePlatformsCheckBox(e);
                              }}
                            />
                          </div>
                          <label
                            className="font-Poppins font-normal text-searchBlack leading-1.31 text-trial cursor-pointer"
                            htmlFor={platform.id as string}
                          >
                            {platform?.name}
                          </label>
                        </div>
                      )
                  )}
              </div>
            )}
            <div
              className="flex justify-between items-center drop w-full box-border bg-signUpDomain h-3.06 px-3 mx-auto  cursor-pointer"
              onClick={() => {
                handleFilterDropDownStatus('tag');
              }}
            >
              <div className="text-searchBlack font-Poppins text-trial leading-1.31 font-semibold">Tags</div>
              <div>
                <img src={downArrow} alt="" className={activateFilter.isTagActive ? 'rotate-0' : 'rotate-180'} />
              </div>
            </div>
            {activateFilter.isTagActive && (
              <div>
                <div className="flex relative items-center pt-2 pb-3">
                  <input
                    type="text"
                    name="search"
                    id="searchId"
                    className="inputs mx-auto focus:outline-none pl-3 pr-7 box-border bg-white shadow-profileCard rounded-0.6 h-2.81 w-15.06 placeholder:text-searchGray placeholder:font-Poppins placeholder:font-normal placeholder:text-card placeholder:leading-1.12"
                    placeholder="Search Tags"
                    onChange={handleTagSearchTextChange}
                  />
                  <div className="absolute right-5 w-0.78 h-0.75  z-40">
                    <img src={searchIcon} alt="" />
                  </div>
                </div>
                <div className="flex flex-col gap-y-5 px-3 max-h-[12.5rem] overflow-scroll">
                  {TagFilterResponse &&
                    TagFilterResponse.map((tags: TagResponseData) => (
                      <div key={tags.id} className="flex items-center mb-2">
                        <div className="mr-2">
                          <input
                            type="checkbox"
                            className="checkbox"
                            id={tags.id as string}
                            name={tags.name as string}
                            checked={(checkedTags[tags.name] as boolean) || false}
                            onChange={(e) => {
                              handleTagsCheckBox(e);
                            }}
                          />
                        </div>
                        <label
                          className="font-Poppins font-normal text-searchBlack leading-1.31 text-trial cursor-pointer"
                          htmlFor={tags.id as string}
                        >
                          {tags.name}
                        </label>
                      </div>
                    ))}
                </div>
              </div>
            )}
            <div
              className="flex justify-between items-center drop w-full box-border bg-signUpDomain h-3.06 px-3 mx-auto  cursor-pointer"
              onClick={() => {
                handleFilterDropDownStatus('activeBetween');
              }}
            >
              <div className="text-searchBlack font-Poppins text-trial leading-1.31 font-semibold">Active between</div>
              <div>
                <img src={downArrow} alt="" className={activateFilter.isActiveBetween ? 'rotate-0' : 'rotate-180'} />
              </div>
            </div>
            {activateFilter.isActiveBetween && (
              <>
                <div className="flex flex-col px-3 pt-4">
                  <label htmlFor="Start Date p-1 font-Inter font-normal leading-4 text-trial text-searchBlack">Start Date</label>
                  <div className="relative flex items-center">
                    <DatePicker
                      selected={startDate}
                      maxDate={new Date()}
                      onChange={(date: Date, event: ChangeEvent<Date>) => selectActiveBetweenDate(event, date, 'start')}
                      className="export w-full h-3.06  shadow-shadowInput rounded-0.3 px-3 font-Poppins font-semibold text-card text-dropGray leading-1.12 focus:outline-none placeholder:font-Poppins placeholder:font-semibold placeholder:text-card placeholder:text-dropGray placeholder:leading-1.12"
                      placeholderText="DD/MM/YYYY"
                      ref={datePickerRefStart}
                      dateFormat="dd/MM/yyyy"
                      onMonthChange={() => {
                        dropDownRef.current = null;
                      }}
                    />
                    <img
                      className="absolute icon-holder right-6 cursor-pointer"
                      src={calendarIcon}
                      alt=""
                      onClick={() => handleClickDatePickerIcon('start')}
                    />
                  </div>
                </div>
                <div className="flex flex-col px-3 pb-4 pt-3">
                  <label htmlFor="Start Date p-1 font-Inter font-Inter font-normal leading-4 text-trial text-searchBlack">End Date</label>
                  <div className="relative flex items-center">
                    <DatePicker
                      selected={endDate}
                      minDate={startDate}
                      maxDate={new Date()}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(date: Date, event: ChangeEvent<Date>) => selectActiveBetweenDate(event, date, 'end')}
                      className="export w-full h-3.06  shadow-shadowInput rounded-0.3 px-3 font-Poppins font-semibold text-card text-dropGray leading-1.12 focus:outline-none placeholder:font-Poppins placeholder:font-semibold placeholder:text-card placeholder:text-dropGray placeholder:leading-1.12"
                      placeholderText="DD/MM/YYYY"
                      ref={datePickerRefEnd}
                      dateFormat="dd/MM/yyyy"
                      onMonthChange={() => {
                        dropDownRef.current = null;
                      }}
                    />
                    <img
                      className="absolute icon-holder right-6 cursor-pointer"
                      src={calendarIcon}
                      alt=""
                      onClick={() => handleClickDatePickerIcon('end')}
                    />
                  </div>
                </div>
              </>
            )}
            <div
              className="flex justify-between items-center drop w-full box-border bg-signUpDomain h-3.06 px-3 mx-auto  cursor-pointer"
              onClick={() => {
                handleFilterDropDownStatus('location');
              }}
            >
              <div className="text-searchBlack font-Poppins text-trial leading-1.31 font-semibold">Location</div>
              <div>
                <img src={downArrow} alt="" className={activateFilter.isLocationActive ? 'rotate-0' : 'rotate-180'} />
              </div>
            </div>
            {activateFilter.isLocationActive && (
              <div>
                <div className="flex relative items-center pt-2 pb-3">
                  <input
                    type="text"
                    name="locationName"
                    id="locationName"
                    className="inputs mx-auto focus:outline-none pl-3 pr-7 box-border bg-white shadow-profileCard rounded-0.6 h-2.81 w-15.06 placeholder:text-searchGray placeholder:font-Poppins placeholder:font-normal placeholder:text-card placeholder:leading-1.12"
                    placeholder="Search Location"
                    onChange={handleLocationSearchTextChange}
                  />
                  <div className="absolute right-5 w-0.78 h-0.75  z-40">
                    <img src={searchIcon} alt="" />
                  </div>
                </div>
                <div className="flex flex-col gap-y-5 px-3 max-h-[12.5rem] overflow-scroll bg-white">
                  {membersLocationFilterResponse &&
                    membersLocationFilterResponse.map(
                      (location: { location: string }, index: number) =>
                        location.location !== null && (
                          <div key={index} className="flex items-center mb-2">
                            <div className="mr-2">
                              <input
                                type="checkbox"
                                id={location.location as string}
                                name={location.location as string}
                                className="checkbox"
                                checked={(checkedLocation[location.location] as boolean) || false}
                                onChange={(e) => {
                                  handleLocationCheckBox(e);
                                }}
                              />
                            </div>
                            <label
                              className="font-Poppins font-normal text-searchBlack leading-1.31 text-trial cursor-pointer"
                              htmlFor={location.location}
                            >
                              {location.location}
                            </label>
                          </div>
                        )
                    )}
                </div>
              </div>
            )}

            <div
              className="flex justify-between items-center drop w-full box-border bg-signUpDomain h-3.06  px-3 mx-auto  cursor-pointer"
              onClick={() => {
                handleFilterDropDownStatus('organization');
              }}
            >
              <div className="text-searchBlack font-Poppins text-trial leading-1.31 font-semibold">Organization</div>
              <div>
                <img src={downArrow} alt="" className={activateFilter.isOrganizationActive ? 'rotate-0' : 'rotate-180'} />
              </div>
            </div>
            {activateFilter.isOrganizationActive && (
              <div className="">
                <div className="flex relative items-center pt-2 pb-3 ">
                  <input
                    type="text"
                    name="organization"
                    id="organizationId"
                    className="inputs mx-auto focus:outline-none pl-3 pr-7 box-border bg-white shadow-profileCard rounded-0.6 h-2.81 w-15.06 placeholder:text-searchGray placeholder:font-Poppins placeholder:font-normal placeholder:text-card placeholder:leading-1.12"
                    placeholder="Search Organization"
                    onChange={handleOrganizationSearchTextChange}
                  />
                  <div className="absolute right-5 w-0.78 h-0.75  z-40">
                    <img src={searchIcon} alt="" />
                  </div>
                </div>
                <div className="flex flex-col gap-y-5 px-3  bg-white max-h-[12.5rem] overflow-scroll">
                  {membersOrganizationFilterResponse &&
                    membersOrganizationFilterResponse.map(
                      (organization: { organization: string }, index: number) =>
                        organization.organization !== null && (
                          <div key={index} className="flex items-center">
                            <div className="mr-2">
                              <input
                                type="checkbox"
                                className="checkbox"
                                id={organization.organization as string}
                                name={organization.organization as string}
                                checked={(checkedOrganization[organization.organization] as boolean) || false}
                                onChange={(e) => {
                                  handleOrganizationCheckBox(e);
                                }}
                              />
                            </div>
                            <label
                              className="font-Poppins font-normal text-searchBlack leading-1.31 text-trial cursor-pointer"
                              htmlFor={organization.organization}
                            >
                              {organization.organization}
                            </label>
                          </div>
                        )
                    )}
                </div>
              </div>
            )}
            <div className="buttons px-2 flex mt-1.56">
              <Button
                disabled={memberColumnsLoader ? true : false}
                type="button"
                onClick={() => {
                  setCheckedPlatform({});
                  setCheckedTags({});
                  setCheckedLocation({});
                  setCheckedOrganization({});
                  setStartDate(undefined);
                  setEndDate(undefined);
                  setFilterCount(0);
                  dispatch(
                    membersSlice.actions.membersList({
                      membersQuery: {
                        page,
                        limit,
                        search: searchText
                      },
                      workspaceId: workspaceId!
                    })
                  );
                }}
                text="Reset"
                className="border border-backdropColor text-black rounded-0.31 h-2.063 w-1/2 mr-1 cursor-pointer text-card font-Manrope font-semibold leading-1.31 hover:text-white hover:bg-backdropColor"
              />
              <Button
                disabled={memberColumnsLoader ? true : false}
                onClick={submitFilterChange}
                type="button"
                text="Apply"
                className={`border-none btn-save-modal rounded-0.31 h-2.063 w-1/2 ml-1 cursor-pointer text-card font-Manrope font-semibold leading-1.31 text-white ${
                  memberColumnsLoader ? 'cursor-not-allowed' : ''
                }`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersFilter;
