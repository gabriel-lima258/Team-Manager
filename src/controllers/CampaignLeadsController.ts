import { Handler } from "express";
import { AddLeadRequestSchema, GetCampaignLeadsRequestSchema, UpdateLeadStatusRequestSchema } from "./schemas/CampaignsRequestSchema";
import { CampaignLeadsService } from "../use-cases/CampaignLeadsService";

export class CampaignLeadsController {
  constructor(private readonly campaignLeadsService: CampaignLeadsService) {}
  getLeads: Handler = async (req, res, next) => {
    try {
      const campaignId = Number(req.params.campaignId)
      const query = GetCampaignLeadsRequestSchema.parse(req.query)
      const { page = "1", pageSize = "10" } = query;
     
      const result = await this.campaignLeadsService.getAllCampaignLeadsParams(campaignId, {
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
      const campaignId = Number(req.params.campaignId);
      const { leadId, status = "New" } = AddLeadRequestSchema.parse(req.body)

      await this.campaignLeadsService.addCampaignLead({
        campaignId,
        leadId,
        status
      })

      res.json(201).end()
    } catch (error) {
      next(error);
    }
  }

  updateLeadStatus: Handler = async (req, res, next) => {
    try {
      const campaignId = Number(req.params.campaignId);
      const leadId = Number(req.params.leadId);
      const { status } = UpdateLeadStatusRequestSchema.parse(req.body)

      await this.campaignLeadsService.updateCampaignLead({
        campaignId,
        leadId,
        status
      })

      res.json({ message: "status updated with success!"})
    } catch (error) {
      next(error);
    }
  }

  removeLead: Handler = async (req, res, next) => {
    try {
      const campaignId = Number(req.params.campaignId);
      const leadId = Number(req.params.leadId);

      await this.campaignLeadsService.deleteCampaignLead(campaignId, leadId)

      res.json({ message: "status removed with success!"})
    } catch (error) {
      next(error);
    }
  }
}