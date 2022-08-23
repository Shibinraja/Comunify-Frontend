/* eslint-disable no-unused-vars */
export interface workspaceId {
  workspaceId: string;
}

// Input Body

export interface GetMembersListQueryParams extends workspaceId {
  membersQuery: {
    page: number;
    limit: number;
    search?: string;
    tags?: {
      checkedTags: string;
      searchedTags: string;
    };
    platforms?: string;
    organization?: {
      checkedOrganization: string;
      searchedOrganization: string;
    };
    location?: {
      checkedLocation: string;
      searchedLocation: string;
    };
    'lastActivity.lte'?: string;
    'lastActivity.gte'?: string;
    'createdAT.lte'?: string;
    'createdAT.gte'?: string;

  };
}

export interface GetMembersTagListQueryParams extends workspaceId {
  membersQuery: {
    tags: {
      checkedTags: string;
      searchedTags: string;
    };
  };
}
export interface GetMembersLocationListQueryParams extends workspaceId {
  membersQuery: {
    location: {
      checkedLocation: string;
      searchedLocation: string;
    };
  };
}

export interface GetMembersOrganizationListQueryParams extends workspaceId {
  membersQuery: {
    organization: {
      checkedOrganization: string;
      searchedOrganization: string;
    };
  };
}

export interface MembersColumnsParams extends workspaceId {
  columnData: {
    name: string;
    id: string;
    isDisplayed: boolean;
    isDraggable: string;
  }[];
}

// Response Body

export type MembersCountResponse = {
  count: number;
  title: string;
  analyticMessage: string;
};

export interface SeriesDataForMemberGraph {
  name: string;
  data: number[];
}

export interface MembersProfileActivityGraphData {
  series: SeriesDataForMemberGraph[];
  xAxis: string[];
}

export interface VerifyMembers {
  workspaceId: string;
  memberId: string;
}

export interface MemberGraphProps {
  activityGraphData: MembersProfileActivityGraphData;
}
export interface VerifyPlatform {
  workspaceId: string;
  memberId: string;
  platform: string;
}

export type MembersListData = {
  id: string;
  name: string;
  userName: string;
  comunifyUserId: string;
  lastActivity: string;
  email: string;
  organization: string;
  profileUrl: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  location?: string;
  platformName: string;
  tags: {
    tag: {
      name: string;
    };
  }[];
  platforms: {
    platform: {
      name: string;
    };
  }[];
};

export type MembersListResponse = {
  data: Array<MembersListData>;
  totalPages: number;
  previousPage: number;
  nextPage: number;
};

export type PlatformResponse = {
  id: string;
  name: string;
  status: string;
  errorMessage: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type MembersTagResponse = {
  createdAt: string;
  id: string;
  name: string;
  updatedAt: Date;
  viewName: string;
  workspaceId: string;
};
export interface DraggableComponentsProps {
  MembersColumn?: boolean;
  handleModalClose: () => void;
}

export interface ActivityResult {
  id: string;
  workspaceId: string;
  activityId: string;
  name: string;
  platform: string;
  type: ActivitiesType.Message;
  value: string;
  displayValue: string;
  sourceUrl: string | null;
  description: string;
  comunifyMemberId: string;
  profilePictureUrl: string;
  platformId: string;
  platformMemberId: string;
  activityTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityDataResponse {
  result: ActivityResult[];
  nextCursor: string | null;
}

export interface ActivityInfiniteScroll {
  workspaceId: string;
  memberId: string;
  nextCursor?: string | null;
}

export enum ActivitiesType {
  Message = 'Message',
  Event = 'Event',
  Thread = 'Thread',
  Reaction = 'Reaction',
  Member = 'Member'
}

export enum CustomDateType {
  Day = '1day',
  Week = '7day',
  Month = '1month'
}

export interface ActivityResult {
  id: string;
  workspaceId: string;
  activityId: string;
  name: string;
  platform: string;
  type: ActivitiesType.Message;
  value: string;
  displayValue: string;
  sourceUrl: string | null;
  description: string;
  comunifyMemberId: string;
  profilePictureUrl: string;
  platformId: string;
  platformMemberId: string;
  activityTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityDataResponse {
  result: ActivityResult[];
  nextCursor: string | null;
}

export interface ActivityInfiniteScroll {
  workspaceId: string;
  memberId: string;
  nextCursor?: string | null;
  platform?: string | null;
  fromDate?: string;
  toDate?: string;
}

export interface MemberProfileCard {
  id: string;
  workspaceId: string;
  name: string;
  platformName: string;
  organization: string | null;
  location: string | null;
  lastActivity: Date | string;
  comunifyMemberId: string;
  email: string;
  profileUrl: string;
  isMerged: boolean;
  parentMemberId: string | null;
  isPrimary: boolean;
  platformId: string;
  platformMemberId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  platforms: {
    id: string;
    name: string;
  }[];
  tags: string[] | null;
}
