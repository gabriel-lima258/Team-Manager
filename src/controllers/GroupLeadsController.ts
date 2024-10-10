import { Handler } from "express"
import { prisma } from "../database"
import { Prisma } from "@prisma/client"
import { GetLeadsRequestSchema } from "./schemas/LeadsRequestSchema"
import { AddLeadRequestSchema } from "./schemas/CampaignsRequestSchema"

export class GroupLeadsController {
  getLeads: Handler = async (req, res, next) => {
    try {
      const groupId = Number(req.params.groupId)
      const query = GetLeadsRequestSchema.parse(req.query)
      const { 
        page = '1',
        pageSize = '10',
        name,
        status,
        sortBy = "name", 
        order = "asc" 
      } = query

      const pageNumber = Number(page)
      const pageSizeNumber = Number(pageSize)

      const where: Prisma.LeadWhereInput = {
        groups: { // filter by campaign id of lead
          some: { id: groupId } // some campaign id of lead, don't need to be for every campaign
        }
      }

      if (name) where.name = { contains: name, mode: "insensitive" }
      if (status) where.status = status

      const leads = await prisma.lead.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip: (pageNumber - 1) * pageSizeNumber,
        take: pageSizeNumber,
        include: {
          groups: true
        }
      })

      const total = await prisma.lead.count({ where })
      
      res.json({
        leads,
        meta: {
          page: pageNumber,
          pageSize: pageSizeNumber,
          total,
          totalPages: Math.ceil(total / pageSizeNumber)
        }
      })
    } catch (error) {
      next(error);
    }
  }

  addLead: Handler = async (req, res, next) => {
    try {
      const body = AddLeadRequestSchema.parse(req.body)

      const updatedGroup = await prisma.group.update({
        data: {
          leads: {
            // connect to a existing lead
            connect: { id: body.leadId }
          }
        },
        where: {
          id: Number(req.params.groupId)
        },
        include: { leads: true }
      })
      res.json(201).end(updatedGroup)
    } catch (error) {
      next(error);
    }
  }

  removeLead: Handler = async (req, res, next) => {
    try {
      const deletedGroup = await prisma.group.update({
        data: {
          leads: {
            // disconnect of a existing lead
            disconnect: { id: Number(req.params.leadId) }
          }
        },
        where: {
          id: Number(req.params.groupId)
        },
        include: { leads: true }
      })
      res.json(deletedGroup)
    } catch (error) {
      next(error);
    }
  }
}