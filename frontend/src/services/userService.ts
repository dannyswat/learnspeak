import api from './api';
import type {
  User,
  UserListResponse,
  UserFilterParams,
  UpdateUserRequest,
  UserJourneyListResponse,
  AssignJourneyRequest,
  UnassignJourneyRequest,
  AssignJourneyResponse,
} from '../types/user';

const USERS_ENDPOINT = '/users';

export const userService = {
  /**
   * Get a user by ID
   */
  async getUser(id: number): Promise<User> {
    const response = await api.get<User>(`${USERS_ENDPOINT}/${id}`);
    return response.data;
  },

  /**
   * Get all learners
   */
  async getLearners(params?: UserFilterParams): Promise<UserListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `${USERS_ENDPOINT}/learners?${queryString}` : `${USERS_ENDPOINT}/learners`;

    const response = await api.get<UserListResponse>(url);
    return response.data;
  },

  /**
   * Get all teachers
   */
  async getTeachers(params?: UserFilterParams): Promise<UserListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `${USERS_ENDPOINT}/teachers?${queryString}` : `${USERS_ENDPOINT}/teachers`;

    const response = await api.get<UserListResponse>(url);
    return response.data;
  },

  /**
   * Search users
   */
  async searchUsers(params?: UserFilterParams): Promise<UserListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `${USERS_ENDPOINT}?${queryString}` : USERS_ENDPOINT;

    const response = await api.get<UserListResponse>(url);
    return response.data;
  },

  /**
   * Update user information
   */
  async updateUser(id: number, data: UpdateUserRequest): Promise<User> {
    const response = await api.put<User>(`${USERS_ENDPOINT}/${id}`, data);
    return response.data;
  },

  /**
   * Get journeys assigned to a user
   */
  async getUserJourneys(userId: number, status?: string, page = 1, pageSize = 20): Promise<UserJourneyListResponse> {
    const queryParams = new URLSearchParams();
    
    if (status) queryParams.append('status', status);
    queryParams.append('page', page.toString());
    queryParams.append('pageSize', pageSize.toString());

    const queryString = queryParams.toString();
    const url = `${USERS_ENDPOINT}/${userId}/journeys?${queryString}`;

    const response = await api.get<UserJourneyListResponse>(url);
    return response.data;
  },

  /**
   * Assign journey to users
   */
  async assignJourney(journeyId: number, data: AssignJourneyRequest): Promise<AssignJourneyResponse> {
    const response = await api.post<AssignJourneyResponse>(`/journeys/${journeyId}/assign`, data);
    return response.data;
  },

  /**
   * Unassign journey from a user
   */
  async unassignUserJourney(userId: number, journeyId: number, request: UnassignJourneyRequest): Promise<void> {
    const response = await api.post<void>(`${USERS_ENDPOINT}/${userId}/journeys/${journeyId}/unassign`, request);
    return response.data;
  },

  /**
   * Delete a user (Admin only)
   */
  async deleteUser(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Search all users (Admin only)
   */
  async searchAllUsers(params?: UserFilterParams): Promise<UserListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `/admin/users?${queryString}` : '/admin/users';

    const response = await api.get<UserListResponse>(url);
    return response.data;
  },

  /**
   * Create a new user (Admin only)
   */
  async createUser(data: {
    username: string;
    password: string;
    email: string;
    name: string;
    roles: string[];
  }): Promise<User> {
    const response = await api.post<User>('/admin/users', data);
    return response.data;
  },
};
