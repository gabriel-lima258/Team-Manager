import { Handler } from "express"
import { GetLeadsRequestSchema } from "./schemas/LeadsRequestSchema"
import { AddLeadRequestSchema } from "./schemas/CampaignsRequestSchema"
import { GroupsRepository } from "../repositories/GroupsRepository"
import { LeadsRepository, LeadWhereParams } from "../repositories/LeadsRepository"

export class GroupLeadsController {
  private groupsRepository: GroupsRepository
  private leadsRepository: LeadsRepository

  constructor(groupsRepository: GroupsRepository, leadsRepository: LeadsRepository) {
    this.groupsRepository = groupsRepository;
    this.leadsRepository = leadsRepository
  }

  getLeads: Handler = async (req, res, next) => {
    try {
      const groupId = Number(req.params.groupId)
      const query = GetLeadsRequestSchema.parse(req.query)
      const { page = "1", pageSize = "10", name, status, sortBy = "name", order = "asc" } = query

      const limit = Number(pageSize)
      const offset = (Number(page) - 1) * limit

      const where: LeadWhereParams = { groupId }

      if (name) where.name = { like: name, mode: "insensitive" }
      if (status) where.status = status

      const leads = await this.leadsRepository.find({
        where,
        sortBy,
        order,
        limit,
        offset,
        include: { groups: true}
      })

      const total = await this.leadsRepository.count(where)

      res.json({
        leads,
        meta: {
          page: Number(page),
          pageSize: limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      })
    } catch (error) {
      next(error);
    }
  }

  addLead: Handler = async (req, res, next) => {
    try {
      const groupId = Number(req.params.groupId);
      const { leadId } = AddLeadRequestSchema.parse(req.body)

      const updatedGroup = this.groupsRepository.addLead(groupId, leadId)
      res.json(201).end(updatedGroup)
    } catch (error) {
      next(error);
    }
  }

  removeLead: Handler = async (req, res, next) => {
    try {
      const groupId = Number(req.params.groupId)
      const leadId = Number(req.params.leadId)
      const deletedGroup = await this.groupsRepository.removeLead(groupId, leadId)
      res.json(deletedGroup)
    } catch (error) {
      next(error);
    }
  }
}