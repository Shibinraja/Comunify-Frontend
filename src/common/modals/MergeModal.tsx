/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import useDebounce from '@/hooks/useDebounce';
import Button from 'common/button';
import { MergeMembersDataResponse, MergeMembersDataResult } from 'modules/members/interface/members.interface';
import { getMemberSuggestionList } from 'modules/members/services/members.services';
import { memberSuggestionType } from 'modules/members/services/service.types';
import React, { ChangeEvent, Fragment, useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useNavigate, useParams } from 'react-router-dom';
import searchIcon from '../../assets/images/search.svg';
import { MemberLoader } from '../Loader/MemberLoader';
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
  const [preventLoading, setPreventLoading] = useState<boolean>(false);
  const [checkedMemberId, setCheckedMemberId] = useState<Record<string, unknown>>({});
  const [selectedMembers, setSelectedMembers] = useState<Array<MergeMembersDataResult>>([]);

  const debouncedValue = useDebounce(searchSuggestion, 300);

  // Function to call the api and list the membersSuggestionList
  // eslint-disable-next-line space-before-function-paren
  const getMemberList = async (props: Partial<memberSuggestionType>, action?: string) => {
    setLoading(true);
    const data = await getMemberSuggestionList({
      workspaceId: workspaceId!,
      memberId: memberId!,
      cursor: props.cursor as string | null,
      prop: props.prop as string,
      search: props.search as string,
      suggestionListCursor: props.suggestionListCursor as string | null
    });
    setLoading(false);
    if (action === 'clearSearch') {
      const CheckedDuplicateMembers = new Set();
      const MembersList = selectedMembers.concat(data?.result as unknown as MergeMembersDataResult).filter((member: MergeMembersDataResult) => {
        const duplicate = CheckedDuplicateMembers.has(member.id);
        CheckedDuplicateMembers.add(member.id);
        return !duplicate;
      });
      setSuggestionList({
        result: MembersList,
        nextCursor: data?.nextCursor as string | null
      });
    } else if (action === 'search') {
      setSuggestionList({
        result: data?.result as unknown as MergeMembersDataResult[],
        nextCursor: data?.nextCursor as string | null
      });
    } else {
      setSuggestionList((prevState) => {
        const CheckedDuplicateMembers = new Set();

        const MemberList = prevState.result.concat(data?.result as unknown as MergeMembersDataResult).filter((member: MergeMembersDataResult) => {
          const duplicate = CheckedDuplicateMembers.has(member.id);
          CheckedDuplicateMembers.add(member.id);
          return !duplicate;
        });
        return {
          result: MemberList,
          nextCursor: data?.nextCursor as string | null
        };
      });
    }
  };

  //useEffect to call the api at initial load.
  useEffect(() => {
    setSuggestionList({
      result: [],
      nextCursor: null
    });
    if (debouncedValue) {
      getMemberList(
        {
          cursor: null,
          prop: 'search',
          search: debouncedValue,
          suggestionListCursor: suggestionList.nextCursor
        },
        'search'
      );
    } else {
      getMemberList(
        {
          cursor: null,
          prop: 'search',
          search: debouncedValue,
          suggestionListCursor: suggestionList.nextCursor
        },
        'clearSearch'
      );
    }
  }, [debouncedValue]);

  // function for scroll event
  // eslint-disable-next-line space-before-function-paren
  const handleScroll = async (event: React.UIEvent<HTMLElement>) => {
    event.preventDefault();
    const { clientHeight, scrollHeight, scrollTop } = event.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 2 && !loading) {
      setActivityNextCursor(suggestionList.nextCursor);
      if (suggestionList.nextCursor) {
        setPreventLoading(true);
        await getMemberList({
          cursor: suggestionList.nextCursor,
          prop: '',
          search: debouncedValue,
          suggestionListCursor: null
        });
        setPreventLoading(false);
      }
    }
  };

  //Function to search of the desired members from DB.
  const handleSearchTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const searchText: string = event.target.value;
    if (!searchText) {
      setSearchSuggestion('');
    } else {
      setSearchSuggestion(searchText);
    }
  };

  //CheckBox selection functionality to chose the preferred duplicate members
  const handleCheckBox = (event: ChangeEvent<HTMLInputElement>) => {
    const checked_id: string = event.target.name;
    setCheckedMemberId((prevValue) => ({ ...prevValue, [checked_id]: event.target.checked }));

    if (event.target.checked) {
      suggestionList.result.filter((memberList: MergeMembersDataResult) => {
        if (memberList.id === checked_id) {
          setSelectedMembers((prevMember) => [...prevMember, memberList]);
        }
      });
    } else {
      suggestionList.result.filter((memberList: MergeMembersDataResult) => {
        if (memberList.id === checked_id) {
          setSelectedMembers((prevMember) => {
            const CheckedMembers = [...prevMember];
            CheckedMembers?.splice(
              CheckedMembers.findIndex((memberId) => memberId.id === memberList.id),
              1
            );
            return CheckedMembers;
          });
        }
      });
    }
  };

  // Routes to review-suggestion page with the members checked from the list.
  const navigateToReviewMerge = () => {
    if (selectedMembers.length) {
      localStorage.setItem('merge-membersId', JSON.stringify(selectedMembers));
      navigate(`/${workspaceId}/members/${memberId}/members-review`);
    }
  };

  const getHighlightedText = (text: string, highlight: string) => {
    const parts = text.split(new RegExp(`(${highlight.replace(/[^a-z .@]/gi, '')})`, 'gi'));
    return (
      <Fragment>
        {parts.map((part: string, index: number) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={index} className="bg-textHighlightColor">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </Fragment>
    );
  };

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
        {!loading && !suggestionList.result?.length && (
          <div className="font-Poppins font-medium text-tableDuration text-lg leading-10 pt-8 pl-2 max-h-96 mb-8 height-member-merge">
            {' '}
            No result found
          </div>
        )}

        {loading && !preventLoading && (
          <div className="flex flex-col gap-5 overflow-y-scroll member-section mt-1.8 max-h-96 height-member-merge ">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((type: number) => (
              <Fragment key={type}>
                <MemberLoader />
              </Fragment>
            ))}
          </div>
        )}
        {suggestionList.result.length > 0 && (
          <div
            id="scrollableDiv"
            className="flex flex-col gap-5 overflow-y-scroll member-section mt-1.8 max-h-96 height-member-merge "
            onScroll={handleScroll}
          >
            {suggestionList?.result.map((member: MergeMembersDataResult, index: number) => (
              <div className="flex border-b border-activitySubCard pb-4" key={index}>
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
                  <div className={`font-Poppins font-medium text-trial text-infoBlack leading-1.31 `}>
                    {getHighlightedText(member.name, searchSuggestion)}
                    {/* Reg Exp function to highlight and show all the values matched with search suggestion string.  */}
                    {/* {member.name.includes(!searchSuggestion ? '/' : searchSuggestion)? member.name.replace(new RegExp(searchSuggestion, 'g'), '') : member.name} */}
                  </div>
                  <div className="text-tagEmail font-Poppins font-normal leading-1.31 text-email pl-1">
                    {getHighlightedText(member.email, searchSuggestion)} | {member.organization}
                  </div>
                  <div className="flex mt-1">
                    <div className="mr-0.34 w-1.001 h-1.001">
                      <img src={member.platform.platformLogoUrl} alt="" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {loading && <MemberLoader />}
          </div>
        )}
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
            className={`submit border-none text-white font-Poppins text-error font-medium leading-1.31 cursor-pointer w-5.25 h-2.81 rounded shadow-contactBtn btn-save-modal ${
              !selectedMembers.length ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={navigateToReviewMerge}
          />
        </div>
      </div>
    </Modal>
  );
};

export default MergeModal;
