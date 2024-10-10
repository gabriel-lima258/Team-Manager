import { Handler } from "express";
import { CreateCampaignRequestSchema, GetCampaignLeadsRequestSchema, UpdateCampaignRequestSchema } from "./schemas/CampaignsRequestSchema";
import { prisma } from "../database";
import { HttpError } from "../errors/HttpError";
import { Prisma } from "@prisma/client";

export class CampaignsController {
  index: Handler = async (req, res, next) => {
    try {
      const query = GetCampaignLeadsRequestSchema.parse(req.query);
      const { 
        page = '1',
        pageSize = '10',
        name,
        sortBy = "name", 
        order = "asc" 
      } = query

      const pageNumber = Number(page)
      const pageSizeNumber = Number(pageSize)

      // type of request input parameters
      const where: Prisma.CampaignWhereInput = {}

      // verify if query contains the value
      if (name) where.name = { contains: name, mode: 'insensitive' }

      const campaigns = await prisma.campaign.findMany({
        where,
        skip: (pageNumber - 1) * pageSizeNumber, // initial = 0
        take: pageSizeNumber,
        orderBy: { [sortBy]: order } // using zod parameters
      })
       
      const total = await prisma.campaign.count({ where })

      res.json({
        data: campaigns,
        meta: {
          page: pageNumber,
          pageSize: pageSizeNumber,
          total,
          totalPages: Math.ceil(total  / pageSizeNumber)
        }
      })
    } catch (error) {
      next(error);
    }
  }

  create: Handler = async (req, res, next) => {
    try {
      const body = CreateCampaignRequestSchema.parse(req.body);
      const newCampaign = await prisma.campaign.create({
        data: body
      }) 
      res.status(201).json(newCampaign)
    } catch (error) {
      next(error);
    }
  }

  show: Handler = async (req, res, next) => {
    try {
      const id = Number(req.params.id);

      const campaign = await prisma.campaign.findUnique({
        where: { id },
        include: { leads: true },
      })

      if (!campaign) {
        throw new HttpError(404, "Campaign not found")
      }

      res.json(campaign)
    } catch (error) {
      next(error);
    }
  }

  update: Handler = async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const body = UpdateCampaignRequestSchema.parse(req.body)

      const campaignExists = await prisma.campaign.findUnique({
        where: { id },
        include: { leads: true },
      })

      if (!campaignExists) {
        throw new HttpError(404, "Campaign not found")
      }

      const updatedCampaign = await prisma.campaign.update({
        data: body,
        where: { id }
      })

      res.json(updatedCampaign)
    } catch (error) {
      next(error);
    }
  }

  delete: Handler = async (req, res, next) => {
    try {
      const id = Number(req.params.id);

      const campaignExists = await prisma.campaign.findUnique({
        where: { id },
        include: { leads: true },
      })

      if (!campaignExists) {
        throw new HttpError(404, "Campaign not found")
      }

      const deletedCampaign = await prisma.campaign.delete({
        where: { id }
      })

      res.json(deletedCampaign)
    } catch (error) {
      next(error);
    }
  }
}