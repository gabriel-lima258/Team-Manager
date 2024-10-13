import { AddLeadToCampaignAttributes, CampaignsRepository, LeadCampaignStatus } from "../repositories/CampaignsRepository"
import { LeadsRepository, LeadWhereParams } from "../repositories/LeadsRepository"

interface GetCampaignLeadsWithPaginationParams {
	page?: number
	pageSize?: number
	name?: string
	status?: LeadCampaignStatus
	sortBy?: "name" | "status" | "createdAt"
	order?: "asc" | "desc"
}


export class CampaignLeadsService {
  constructor(private readonly campaignsRepository: CampaignsRepository, private readonly leadsRepository: LeadsRepository) {}

  async getAllCampaignLeadsParams(id: number, params: GetCampaignLeadsWithPaginationParams) {
    const { name, status, page = 1, pageSize = 10, sortBy, order } = params

    // convert string to number
    const limit = pageSize
    const offset = (page - 1) * limit

    // type of request input parameters
    const where: LeadWhereParams = { campaignId: id }

    // verify if query contains the value
    if (name) where.name = { like: name, mode: 'insensitive' }
    if (status) where.campaignStatus = status

    const leads = await this.leadsRepository.find({
      where,
      sortBy,
      order,
      limit,
      offset,
    })
    const total = await this.leadsRepository.count(where)

    return {
      leads,
      meta: {
      page: Number(page),
      pageSize: limit,
      total,
      totalPages: Math.ceil(total / limit)
      }
    }

  }

  async addCampaignLead(params: AddLeadToCampaignAttributes) {
    const updatedCampaign = this.campaignsRepository.addLead(params)
    return updatedCampaign
  }

  async updateCampaignLead(params: AddLeadToCampaignAttributes) {
    const updatedCampaign = this.campaignsRepository.updateLeadStatus(params)
    return updatedCampaign
  }

  async deleteCampaignLead(campaignId: number, leadId: number) {
    const deletedCampaign = await this.campaignsRepository.removeLead(campaignId, leadId)
    return deletedCampaign
  }
}