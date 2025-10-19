import api from './api';
import type {
  Journey,
  JourneyListResponse,
  CreateJourneyRequest,
  UpdateJourneyRequest,
  JourneyFilterParams,
  CreateInvitationRequest,
  InvitationResponse,
  InvitationDetailsResponse,
} from '../types/journey';

const JOURNEYS_ENDPOINT = '/journeys';

export const journeyService = {
  /**
   * Get a list of journeys with optional filtering
   */
  async getJourneys(params?: JourneyFilterParams): Promise<JourneyListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.languageCode) queryParams.append('languageCode', params.languageCode);
    if (params?.createdBy) queryParams.append('createdBy', params.createdBy.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.includeTopics) queryParams.append('includeTopics', 'true');

    const queryString = queryParams.toString();
    const url = queryString ? `${JOURNEYS_ENDPOINT}?${queryString}` : JOURNEYS_ENDPOINT;

    const response = await api.get<JourneyListResponse>(url);
    return response.data;
  },

  /**
   * Get a single journey by ID
   */
  async getJourney(id: number, includeTopics = false): Promise<Journey> {
    const queryParams = includeTopics ? '?includeTopics=true' : '';
    const response = await api.get<Journey>(`${JOURNEYS_ENDPOINT}/${id}${queryParams}`);
    return response.data;
  },

  /**
   * Create a new journey
   */
  async createJourney(data: CreateJourneyRequest): Promise<Journey> {
    const response = await api.post<Journey>(JOURNEYS_ENDPOINT, data);
    return response.data;
  },

  /**
   * Update an existing journey
   */
  async updateJourney(id: number, data: UpdateJourneyRequest): Promise<Journey> {
    const response = await api.put<Journey>(`${JOURNEYS_ENDPOINT}/${id}`, data);
    return response.data;
  },

  /**
   * Delete a journey
   */
  async deleteJourney(id: number): Promise<void> {
    await api.delete(`${JOURNEYS_ENDPOINT}/${id}`);
  },

  /**
   * Reorder topics in a journey
   */
  async reorderTopics(id: number, topicIds: number[]): Promise<void> {
    await api.post(`${JOURNEYS_ENDPOINT}/${id}/reorder`, topicIds);
  },

  /**
   * Start a journey (mark as in_progress)
   */
  async startJourney(id: number): Promise<{ message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(`${JOURNEYS_ENDPOINT}/${id}/start`);
    return response.data;
  },

  /**
   * Generate an invitation link for a journey
   */
  async generateInvitation(id: number, data: CreateInvitationRequest): Promise<InvitationResponse> {
    const response = await api.post<InvitationResponse>(`${JOURNEYS_ENDPOINT}/${id}/invite`, data);
    return response.data;
  },

  /**
   * Get all invitations for a journey
   */
  async getJourneyInvitations(id: number): Promise<InvitationResponse[]> {
    const response = await api.get<InvitationResponse[]>(`${JOURNEYS_ENDPOINT}/${id}/invitations`);
    return response.data;
  },

  /**
   * Deactivate an invitation
   */
  async deactivateInvitation(journeyId: number, invitationId: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`${JOURNEYS_ENDPOINT}/${journeyId}/invitations/${invitationId}`);
    return response.data;
  },

  /**
   * Get invitation details (public, no auth required)
   */
  async getInvitationDetails(token: string): Promise<InvitationDetailsResponse> {
    const response = await api.get<InvitationDetailsResponse>(`/invitations/${token}`);
    return response.data;
  },

  /**
   * Accept an invitation
   */
  async acceptInvitation(token: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/invitations/${token}/accept`);
    return response.data;
  },
};
