import { GroupsRepository } from "../repositories/GroupsRepository";
import { LeadsRepository, LeadStatus, LeadWhereParams } from "../repositories/LeadsRepository";

interface GetGroupLeadsWithPaginationParams {
	page?: number
	pageSize?: number
	name?: string
	status?: LeadStatus
	sortBy?: "name" | "status" | "createdAt"
	order?: "asc" | "desc"
}

export class GroupLeadsService {

  constructor(private readonly groupsRepository: GroupsRepository, private readonly leadsRepository: LeadsRepository) {}

  async getAllGroupsLeadsParams(id: number, params: GetGroupLeadsWithPaginationParams) {
    const { name, status, page = 1, pageSize = 10, sortBy, order } = params

    // convert string to number
    const limit = pageSize
    const offset = (page - 1) * limit

    // type of request input parameters
    const where: LeadWhereParams = { groupId: id }

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

  async addGroupLead(groupId: number, leadId: number) {
    const updatedGroup = this.groupsRepository.addLead(groupId, leadId)
    return updatedGroup
  }

  async deleteGroupLead(groupId: number, leadId: number) {
    const deletedGroup = await this.groupsRepository.removeLead(groupId, leadId)
    return deletedGroup
  }
}