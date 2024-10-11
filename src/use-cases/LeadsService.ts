import { HttpError } from "../errors/HttpError"
import { CreateLeadAttributes, LeadsRepository, LeadStatus, LeadWhereParams } from "../repositories/LeadsRepository"

interface GetLeadsWithPaginationParams {
	page?: number
	pageSize?: number
	name?: string
	status?: LeadStatus
	sortBy?: "name" | "status" | "createdAt"
	order?: "asc" | "desc"
}

export class LeadsService {

  constructor(private readonly leadsRepository: LeadsRepository) {}

  async getAllLeadsPaginated(params: GetLeadsWithPaginationParams) {
    const { name, status, page = 1, pageSize = 10, sortBy, order } = params

          // convert string to number
    const limit = pageSize
    const offset = (page - 1) * limit

    // type of request input parameters
    const where: LeadWhereParams = {}

    // verify if query contains the value
    if (name) where.name = { like: name, mode: 'insensitive' }
    if (status) where.status = status

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

  async createLead(params: CreateLeadAttributes) {
    if (!params.status) {
      params.status = "New"
    }

    const newLead = await this.leadsRepository.create(params)
    
    return newLead
  }

  async getLeadById(id: number) {
    const lead = await this.leadsRepository.findById(id)

    if (!lead) {
      throw new HttpError(404, 'Lead not found!')
    }

    return lead
  }
   
  async updateLead(leadId: number, params: Partial<CreateLeadAttributes>) {
    const leadExist= await this.leadsRepository.findById(leadId)

    if (!leadExist) {
      throw new HttpError(404, 'Lead not found!')
    }

    // verify if lead already was contacted
    if (leadExist.status === "New" && params.status !== "Contacted") {
      throw new HttpError(404, 'A new lead must contacted before changing the status')
    }

    // Validate the inactivity if he it was archived
    if (params.status === "Archived") {
      const now = new Date(); // updated date
      const diffTime = Math.abs(now.getTime() - leadExist.updatedAt.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      // alerting if the lead was archived less than 6 months
      if (diffDays < 180) {
        throw new HttpError(400, "A lead must be archived after 6 months")
      }
    }

    const updatedLead = await this.leadsRepository.updateById(leadId, params)

    return updatedLead
  }

  async deleteLead(leadId: number) {
    const leadExist = await this.leadsRepository.findById(leadId)

    if (!leadExist) {
      throw new HttpError(404, 'Lead not found!')
    }

    const deletedLead = await this.leadsRepository.deleteById(leadId)

    return deletedLead
  }
}