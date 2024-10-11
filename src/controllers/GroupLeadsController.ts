import { Handler } from "express"
import { GetLeadsRequestSchema } from "./schemas/LeadsRequestSchema"
import { AddLeadRequestSchema } from "./schemas/CampaignsRequestSchema"
import { GroupLeadsService } from "../use-cases/GroupLeadsService"

export class GroupLeadsController {
  constructor(private readonly groupLeadsService: GroupLeadsService) {}

  getLeads: Handler = async (req, res, next) => {
    try {
      const groupId = Number(req.params.groupId)
      const query = GetLeadsRequestSchema.parse(req.query);
      const { page = "1", pageSize = "10" } = query;

      const result = await this.groupLeadsService.getAllGroupsLeadsParams(groupId ,{
        ...query,
        page: +page,
        pageSize: +pageSize
      })

      res.json(result)
    } catch (error) {
      next(error);
    }
  }

  addLead: Handler = async (req, res, next) => {
    try {
      const groupId = Number(req.params.groupId);
      const { leadId } = AddLeadRequestSchema.parse(req.body)

      const updatedGroup = await this.groupLeadsService.addGroupLead(groupId, leadId)

      res.json(201).end(updatedGroup)
    } catch (error) {
      next(error);
    }
  }

  removeLead: Handler = async (req, res, next) => {
    try {
      const groupId = Number(req.params.groupId)
      const leadId = Number(req.params.leadId)
      
      const deletedGroup = await this.groupLeadsService.deleteGroupLead(groupId, leadId)

      res.json(deletedGroup)
    } catch (error) {
      next(error);
    }
  }
}