import { Handler } from "express";
import { AddLeadRequestSchema, GetCampaignLeadsRequestSchema, UpdateLeadStatusRequestSchema } from "./schemas/CampaignsRequestSchema";
import { CampaignsRepository } from "../repositories/CampaignsRepository";
import { LeadsRepository, LeadWhereParams } from "../repositories/LeadsRepository";

export class CampaignLeadsController {
  private campaignsRepository: CampaignsRepository
  private leadsRepository: LeadsRepository

  constructor(campaignsRepository: CampaignsRepository, leadsRepository: LeadsRepository) {
    this.campaignsRepository = campaignsRepository;
    this.leadsRepository = leadsRepository
  }

  getLeads: Handler = async (req, res, next) => {
    try {
      const campaignId = Number(req.params.campaignId)
      const query = GetCampaignLeadsRequestSchema.parse(req.query)
      const { page = "1", pageSize = "10", name, status, sortBy = "name", order = "asc" } = query

      const limit = Number(pageSize)
      const offset = (Number(page) - 1) * limit

      const where: LeadWhereParams = { campaignId, campaignStatus: status }

      if (name) where.name = { like: name, mode: "insensitive" }

      const leads = await this.leadsRepository.find({
        where,
        sortBy,
        order,
        limit,
        offset,
        include: { campaigns: true}
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
      const campaignId = Number(req.params.campaignId);
      const { leadId, status = "New" } = AddLeadRequestSchema.parse(req.body)

      await this.campaignsRepository.addLead({
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

      await this.campaignsRepository.updateLeadStatus({
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

      await this.campaignsRepository.removeLead(campaignId, leadId)

      res.json({ message: "status removed with success!"})
    } catch (error) {
      next(error);
    }
  }
}