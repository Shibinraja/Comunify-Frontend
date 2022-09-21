/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import useDebounce from '@/hooks/useDebounce';
import Button from 'common/button';
import { MergeMembersDataResponse, MergeMembersDataResult } from 'modules/members/interface/members.interface';
import { getMemberSuggestionList } from 'modules/members/services/members.services';
import { memberSuggestionType } from 'modules/members/services/service.types';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import Modal from 'react-modal';
import { useNavigate, useParams } from 'react-router-dom';
import searchIcon from '../../assets/images/search.svg';
import { MergeModalProps } from './MergeModalTypes';

const MergeModal: React.FC<MergeModalProps> = ({ modalOpen, setModalOpen }) => {
  const { workspaceId, memberId } = useParams();
  const navigate = useNavigate();

  const [searchSuggestion, setSearchSuggestion] = useState<string>('');
  const [activityNextCursor, setActivityNextCursor] = useState<string | null>('');
  const [suggestionList, setSuggestionList] = useState<MergeMembersDataResponse>({
    result: [],
    nextCursor: null
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [checkedMemberId, setCheckedMemberId] = useState<Record<string, unknown>>({});
  const [duplicateMembers, setDuplicateMembers] = useState<Array<MergeMembersDataResult>>([]);

  const CheckedDuplicateMembers = new Set();
  const debouncedValue = useDebounce(searchSuggestion, 300);
  const member_scroll = useRef<HTMLDivElement>(null);
  // Function to call the api and list the membersSuggestionList
  const getMemberList = (props: Partial<memberSuggestionType>) => {
    getMemberSuggestionList(
      {
        workspaceId: workspaceId!,
        memberId: memberId!,
        cursor: props.cursor as string | null,
        prop: props.prop as string,
        search: props.search as string,
        suggestionListCursor: props.suggestionListCursor as string | null
      },
      setLoading
    ).then((data) =>
      setSuggestionList((prevState) => ({
        result: prevState.result.concat(data?.result as unknown as MergeMembersDataResult),
        nextCursor: data?.nextCursor as string | null
      }))
    );
  };

  //useEffect to call the api at initial load.
  useEffect(() => {
    setSuggestionList({
      result: [],
      nextCursor: null
    });
    getMemberList({
      cursor: null,
      prop: 'search',
      search: debouncedValue,
      suggestionListCursor: suggestionList.nextCursor
    });
  }, [debouncedValue]);

  // Effect to fetch the member which are checked to continue to merge with the primary member id.
  useEffect(() => {
    if (Object.keys(checkedMemberId).length > 0) {
      Object.keys(checkedMemberId).map((memberId: string) => {
        suggestionList.result.filter((memberList: MergeMembersDataResult) => {
          if (checkedMemberId[memberId] === true) {
            if (memberList.id === memberId) {
              setDuplicateMembers((prevMember) => [...new Set(prevMember), memberList]);
            }
          }
          if (checkedMemberId[memberId] === false) {
            if (memberList.id === memberId) {
              setDuplicateMembers((prevMember) => {
                const CheckedMembers = [...prevMember];
                CheckedMembers?.splice(
                  CheckedMembers.findIndex((memberId) => memberId.id === memberList.id),
                  1
                );
                return CheckedMembers;
              });
            }
          }
        });
      });
    }
    // setSearchSuggestion('');
  }, [checkedMemberId]);

  // function for scroll event
  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    event.preventDefault();
    const { clientHeight, scrollHeight, scrollTop } = event.currentTarget;

    console.log({ scrollHeight, scrollTop, clientHeight });
    console.log('err', Math.floor(scrollHeight) - Math.floor(scrollTop) === Math.floor(clientHeight));
    console.log('err', event);
    if (Math.floor(scrollHeight) - Math.floor(scrollTop) === Math.floor(clientHeight)) {
      setActivityNextCursor(suggestionList.nextCursor);
      if (suggestionList.nextCursor !== null && !loading) {
        getMemberList({
          cursor: suggestionList.nextCursor,
          prop: '',
          search: debouncedValue,
          suggestionListCursor: null
        });
      }
    }
  };

  //Function to search of the desired members from DB.
  const handleSearchTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const searchText: string = event.target.value;
    if (!searchText) {
      setSearchSuggestion('');
      getMemberList({
        cursor: null,
        prop: 'search',
        search: debouncedValue,
        suggestionListCursor: suggestionList.nextCursor
      });
    }
    setSearchSuggestion(searchText);
  };

  //CheckBox selection functionality to chose the preffered duplicate members
  const handleCheckBox = (event: ChangeEvent<HTMLInputElement>) => {
    const checked_id: string = event.target.name;
    setCheckedMemberId((prevValue) => ({ ...prevValue, [checked_id]: event.target.checked }));
  };

  // Routes to review-suggestion page with the members checked from the list.
  const navigateToReviewMerge = () => {
    if (duplicateMembers.length) {
      localStorage.setItem('merge-membersId', JSON.stringify(duplicateMembers));
      navigate(`/${workspaceId}/members/${memberId}/members-review`);
    }
  };

  // Function to concat the data checked with the api response list and show the checked data at first for readability,
  const MembersList = duplicateMembers.concat(suggestionList.result).filter((member: MergeMembersDataResult) => {
    const duplicate = CheckedDuplicateMembers.has(member.comunifyMemberId);
    CheckedDuplicateMembers.add(member.comunifyMemberId);
    return !duplicate;
  });

  // Ternary Condition to show the list needed in the pop-up
  const MergeMemberList = searchSuggestion ? suggestionList.result : MembersList;

  return (
    <Modal
      isOpen={modalOpen}
      shouldCloseOnOverlayClick={false}
      onRequestClose={() => setModalOpen(false)}
      className="w-24.31  mx-auto rounded-lg modals-tag bg-white shadow-modal pt-10 px-8"
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
        <h3 className="font-Inter font-semibold text-xl leading-1.43">Merge Members</h3>
        <div className="flex relative items-center mt-1.43">
          <input
            type="text"
            className="input-merge-search focus:outline-none px-3 pr-8 box-border border border-borderPrimary w-20.5 h-3.06 rounded-0.6 shadow-profileCard placeholder:font-Poppins placeholder:font-normal placeholder:text-card placeholder:leading-1.31 placeholder:text-searchGray"
            placeholder="Search Members"
            value={searchSuggestion}
            onChange={handleSearchTextChange}
          />
          <div className="absolute right-4 w-0.78 h-3 z-40">
            <img src={searchIcon} alt="" />
          </div>
        </div>
        {!MergeMemberList?.length && <div className="font-Poppins font-medium text-tableDuration text-lg leading-10 pt-8 pl-2"> No data found</div>}
        <div
          className="flex flex-col gap-5 overflow-scroll overflow-y-scroll member-section mt-1.8 height-member-merge"
          onScroll={handleScroll}
          ref={member_scroll}
        >
          {loading ? (
            <div className="flex flex-col  gap-5 overflow-scroll ">
              <Skeleton width={500} className={'my-4'} count={6} />
            </div>
          ) : (
            suggestionList?.result &&
            MergeMemberList.map((member: MergeMembersDataResult, index: number) => (
              <div className="flex border-b border-activitySubCard pb-4 pt-6" key={index}>
                <div className="mr-0.34">
                  <input
                    type="checkbox"
                    className="checkbox"
                    id={member.id}
                    name={member.id}
                    checked={(checkedMemberId[member.id] as boolean) || false}
                    onChange={handleCheckBox}
                  />
                </div>
                <div className="flex flex-col ">
                  {/* Reg Exp function to highlight and show all the values matched with search suggestion string.  */}
                  <div
                    className={`font-Poppins font-medium text-trial text-infoBlack leading-1.31 ${
                      new RegExp(!searchSuggestion ? '/' : searchSuggestion).test(member.name.toLocaleLowerCase()) ? 'bg-yellow-500' : ''
                    }`}
                  >
                    {member.name}
                  </div>
                  <div className="text-tagEmail font-Poppins font-normal leading-1.31 text-email pl-1">
                    {member.email} | {member.organization}
                  </div>
                  <div className="flex mt-2.5">
                    <div className="mr-0.34 w-1.001 h-1.001">
                      <img src={member.platform.platformLogoUrl} alt="" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-end mt-1.8 pb-53 ">
          <Button
            type="button"
            text="CANCEL"
            className="mr-2.5 font-Poppins text-error font-medium border-cancel  leading-1.31 text-thinGray cursor-pointer w-5.25 h-2.81 rounded box-border"
            onClick={() => setModalOpen(false)}
          />
          <Button
            type="button"
            text="SUBMIT"
            className="submit border-none text-white font-Poppins text-error font-medium leading-1.31 cursor-pointer w-5.25 h-2.81 rounded shadow-contactBtn btn-save-modal"
            onClick={navigateToReviewMerge}
          />
        </div>
      </div>
    </Modal>
  );
};

export default MergeModal;
